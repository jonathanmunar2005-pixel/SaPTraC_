const FuelTransaction = require('../models/fuelTransaction.model');
const Schedule = require('../models/schedule.model');
const mongoose = require('mongoose');
const qrScanner = require('../utils/qrScanner');
const { getIO } = require('../socket/socket');
const User = require('../models/User');
const Unit = require('../models/unit.model');
const Driver = require('../models/driver.model');
const { createNotification } = require('./notification.service');

// === Fuel Anomaly Detection Config ===
const anomalyConfig = {
  maxMileagePerShift: 1000, // km
  maxFuelLitersPerShift: 500, // liters
  maxFuelCostPerShift: 20000, // currency units
  minFuelEfficiency: 1, // km/l (unrealistically low efficiency triggers anomaly)
  maxFuelEfficiency: 10, // km/l (unrealistically high efficiency triggers anomaly)
  maxDuplicateWindowMinutes: 10, // minutes for repeated suspicious transactions
};

// Helper: Validate odometer and shift transition logic
async function validateOdometerAndShift({ driver, unit, shiftType, odometerIn, odometerOut, transactionDate, excludeId = null }) {
  // Prevent negative mileage
  if (odometerIn < 0 || (odometerOut !== undefined && odometerOut < 0)) {
    throw { status: 400, message: 'Odometer readings cannot be negative.' };
  }
  // Prevent unrealistic mileage jumps (e.g., > 1000km in one shift)
  if (odometerOut !== undefined && odometerOut !== null) {
    const mileage = odometerOut - odometerIn;
    if (mileage < 0) {
      throw { status: 400, message: 'Odometer OUT cannot be less than IN.' };
    }
    if (mileage > 1000) {
      throw { status: 400, message: 'Unrealistic mileage jump detected.' };
    }
  }
  // Shift transition rules
  // 1st shift OUT == 2nd shift IN, 2nd shift OUT == next 1st shift IN
  // Find previous and next transactions for this unit
  const prevTx = await FuelTransaction.findOne({
    unit,
    deletedAt: null,
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  }).sort({ transactionDate: -1 });
  if (prevTx && prevTx.odometerOut !== undefined && prevTx.odometerOut !== null) {
    if (odometerIn !== prevTx.odometerOut) {
      throw { status: 400, message: 'Odometer IN must match previous OUT for this unit.' };
    }
  }
  // Optionally, check next transaction for update
  if (odometerOut !== undefined && odometerOut !== null) {
    const nextTx = await FuelTransaction.findOne({
      unit,
      deletedAt: null,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
      transactionDate: { $gt: transactionDate },
    }).sort({ transactionDate: 1 });
    if (nextTx && nextTx.odometerIn !== undefined && nextTx.odometerIn !== null) {
      if (odometerOut !== nextTx.odometerIn) {
        throw { status: 400, message: 'Odometer OUT must match next IN for this unit.' };
      }
    }
  }
}

// Helper: Detect duplicate transaction
async function isDuplicateTransaction({ driver, unit, shiftType, transactionDate, excludeId = null }) {
  const filter = {
    driver,
    unit,
    shiftType,
    transactionDate,
    deletedAt: null,
  };
  if (excludeId) filter._id = { $ne: excludeId };
  const exists = await FuelTransaction.findOne(filter);
  return !!exists;
}

// Helper: Notify admins of anomaly
async function notifyAdminsOfAnomaly({ tx, reasons }) {
  // Find all admin users
  const admins = await User.find({ role: { $in: ['Super Admin', 'Administrator', 'Operational Manager'] }, isActive: true });
  if (!admins.length) return;
  // Populate unit and driver names
  let unitName = tx.unit;
  let driverName = tx.driver;
  try {
    const unit = await Unit.findById(tx.unit);
    if (unit) unitName = unit.plateNumber || unit.bodyNumber || String(unit._id);
    const driver = await Driver.findById(tx.driver);
    if (driver) driverName = driver.firstName + ' ' + driver.lastName;
  } catch {}
  // Send notification to each admin
  for (const admin of admins) {
    await createNotification({
      recipient: admin._id,
      title: 'Fuel Anomaly Detected',
      message: `Anomaly: ${reasons.join('; ')} | Unit: ${unitName} | Driver: ${driverName}`,
      type: 'FuelAnomaly',
    });
  }
  // Emit real-time alert to all admins
  const io = getIO();
  io.emit('fuelAnomalyAlert', {
    reason: reasons.join('; '),
    unit: unitName,
    driver: driverName,
    transactionDate: tx.transactionDate,
  });
}

// === Anomaly Detection Functions ===
async function detectAnomalies({ driver, unit, shiftType, odometerIn, odometerOut, fuelLiters, fuelCost, transactionDate, excludeId = null }) {
  const anomalies = [];
  // 1. Unrealistic mileage
  if (odometerOut !== undefined && odometerOut !== null) {
    const mileage = odometerOut - odometerIn;
    if (mileage < 0) {
      anomalies.push('Odometer OUT less than IN');
    } else if (mileage > anomalyConfig.maxMileagePerShift) {
      anomalies.push('Unrealistic mileage jump');
    }
    // 2. Abnormal fuel consumption (efficiency)
    if (fuelLiters && mileage >= 50) {
      const efficiency = mileage / fuelLiters;
      if (efficiency < anomalyConfig.minFuelEfficiency) {
        anomalies.push('Abnormally low fuel efficiency');
      } else if (efficiency > anomalyConfig.maxFuelEfficiency) {
        anomalies.push('Abnormally high fuel efficiency');
      }
    }
  }
  // 3. Excessive fuel request
  if (fuelLiters && fuelLiters > anomalyConfig.maxFuelLitersPerShift) {
    anomalies.push('Excessive fuel request');
  }
  if (fuelCost && fuelCost > anomalyConfig.maxFuelCostPerShift) {
    anomalies.push('Excessive fuel cost');
  }
  // 4. Repeated suspicious transactions (same driver/unit/schedule/shiftType within short window)
  const windowStart = new Date(new Date(transactionDate).getTime() - anomalyConfig.maxDuplicateWindowMinutes * 60000);
  const duplicate = await FuelTransaction.findOne({
    driver,
    unit,
    shiftType,
    deletedAt: null,
    transactionDate: { $gte: windowStart, $lte: transactionDate },
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  });
  if (duplicate) {
    anomalies.push('Repeated suspicious transaction in short window');
  }
  // 5. Missing odometer continuity (checked in validateOdometerAndShift, but flag here for completeness)
  // (Handled in validateOdometerAndShift, so not repeated here)
  return anomalies;
}

// Create Fuel Transaction
async function createFuelTransactionService(data) {
  const { driver, unit, shiftType, odometerIn, odometerOut, transactionDate, fuelLiters, fuelCost } = data;
  // Duplicate check
  if (await isDuplicateTransaction({ driver, unit, shiftType, transactionDate })) {
    throw { status: 409, message: 'Duplicate fuel transaction detected.' };
  }
  // Odometer/shift validation
  await validateOdometerAndShift({ driver, unit, shiftType, odometerIn, odometerOut, transactionDate });
  // Anomaly detection
  const anomalies = await detectAnomalies({ driver, unit, shiftType, odometerIn, odometerOut, fuelLiters, fuelCost, transactionDate });
  const tx = new FuelTransaction({
    ...data,
    anomalyDetected: anomalies.length > 0,
    anomalyReason: anomalies.length > 0 ? anomalies.join('; ') : null,
  });
  await tx.save();

await Driver.findByIdAndUpdate(driver, {
  $inc: {
    totalLifetimeDieselConsumption: fuelLiters,
    totalLifetimeFuelCost: fuelCost,
  },
});

await Unit.findByIdAndUpdate(unit, {
  $inc: {
    totalLifetimeDieselConsumption: fuelLiters,
    totalLifetimeFuelCost: fuelCost,
  },
});

if (anomalies.length > 0) {
  await notifyAdminsOfAnomaly({ tx, reasons: anomalies });
}

return tx;
}
// Get Fuel Transactions (pagination, search, filter)
async function getFuelTransactionsService({ page = 1, limit = 10, search = '', ...filters }) {
  page = parseInt(page);
  limit = parseInt(limit);
  const query = { deletedAt: null };
  if (filters.driver) query.driver = filters.driver;
  if (filters.unit) query.unit = filters.unit;
  if (filters.shiftType) query.shiftType = filters.shiftType;
  if (filters.transactionDate) query.transactionDate = filters.transactionDate;
  if (filters.anomalyDetected !== undefined) query.anomalyDetected = filters.anomalyDetected;
  if (search) {
    query.$or = [
      { fuelStation: { $regex: search, $options: 'i' } },
      { remarks: { $regex: search, $options: 'i' } },
      { qrCodeData: { $regex: search, $options: 'i' } },
    ];
  }
  const total = await FuelTransaction.countDocuments(query);
  const transactions = await FuelTransaction.find(query)
    .sort({ transactionDate: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('driver unit schedule recordedBy');
  return {
    transactions,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

// Get Single Fuel Transaction
async function getSingleFuelTransactionService(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw { status: 400, message: 'Invalid transaction ID.' };
  }
  const tx = await FuelTransaction.findOne({ _id: id, deletedAt: null }).populate('driver unit schedule recordedBy');
  if (!tx) throw { status: 404, message: 'Fuel transaction not found.' };
  return tx;
}

// Update Fuel Transaction
async function updateFuelTransactionService(id, data) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw { status: 400, message: 'Invalid transaction ID.' };
  }
  const tx = await FuelTransaction.findOne({ _id: id, deletedAt: null });
  if (!tx) throw { status: 404, message: 'Fuel transaction not found.' };
  // Duplicate check
  if (await isDuplicateTransaction({
    driver: data.driver || tx.driver,
    unit: data.unit || tx.unit,
    shiftType: data.shiftType || tx.shiftType,
    transactionDate: data.transactionDate || tx.transactionDate,
    excludeId: id,
  })) {
    throw { status: 409, message: 'Duplicate fuel transaction detected.' };
  }
  // Odometer/shift validation
  await validateOdometerAndShift({
    driver: data.driver || tx.driver,
    unit: data.unit || tx.unit,
    shiftType: data.shiftType || tx.shiftType,
    odometerIn: data.odometerIn !== undefined ? data.odometerIn : tx.odometerIn,
    odometerOut: data.odometerOut !== undefined ? data.odometerOut : tx.odometerOut,
    transactionDate: data.transactionDate || tx.transactionDate,
    excludeId: id,
  });
  // Anomaly detection
  const anomalies = await detectAnomalies({
    driver: data.driver || tx.driver,
    unit: data.unit || tx.unit,
    shiftType: data.shiftType || tx.shiftType,
    odometerIn: data.odometerIn !== undefined ? data.odometerIn : tx.odometerIn,
    odometerOut: data.odometerOut !== undefined ? data.odometerOut : tx.odometerOut,
    fuelLiters: data.fuelLiters !== undefined ? data.fuelLiters : tx.fuelLiters,
    fuelCost: data.fuelCost !== undefined ? data.fuelCost : tx.fuelCost,
    transactionDate: data.transactionDate || tx.transactionDate,
    excludeId: id,
  });
  Object.assign(tx, data, {
    anomalyDetected: anomalies.length > 0,
    anomalyReason: anomalies.length > 0 ? anomalies.join('; ') : null,
  });
  await tx.save();
  if (anomalies.length > 0) {
    await notifyAdminsOfAnomaly({ tx, reasons: anomalies });
  }
  return tx;
}

// Soft Delete Fuel Transaction
async function deleteFuelTransactionService(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw { status: 400, message: 'Invalid transaction ID.' };
  }
  const tx = await FuelTransaction.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { $set: { deletedAt: new Date() } },
    { new: true }
  );
  if (!tx) throw { status: 404, message: 'Fuel transaction not found.' };
  return { message: 'Fuel transaction deleted successfully.' };
}

// Utility: Scan QR and fetch driver/unit (for use in controllers/services)
async function scanQRAndFetchEntity(qrInput) {
  // qrInput: Data URL string or image buffer
  // Returns: { type: 'driver'|'unit', data, payload }
  return await qrScanner.scanAndFetchEntity(qrInput);
}

module.exports = {
  createFuelTransactionService,
  getFuelTransactionsService,
  getSingleFuelTransactionService,
  updateFuelTransactionService,
  deleteFuelTransactionService,
  scanQRAndFetchEntity, // Exported for controller use
};
