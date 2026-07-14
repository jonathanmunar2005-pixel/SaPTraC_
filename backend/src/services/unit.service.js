console.log("ENV FRONTEND_URL:", process.env.FRONTEND_URL);
const Unit = require('../models/unit.model');
const mongoose = require('mongoose');
const generateQRCode = require('../utils/generateQRCode');
const FRONTEND_URL = process.env.FRONTEND_URL;

async function getUnitByQRService(code) {

  let payload;

  try {
  payload = JSON.parse(code);
} catch {
  if (code.includes("/unit/")) {
    const id = code.split("/unit/")[1];

    const unit = await Unit.findById(id);

    if (!unit) {
      throw {
        status: 404,
        message: "Unit not found"
      };
    }

    return unit;
  }

  throw {
    status: 400,
    message: "Invalid QR Code"
  };
}

  return unit;
}

async function getUnitsDropdownService() {
  return Unit.find(
    {
      deletedAt: null,
    },
    {
      bodyNumber: 1,
      route: 1,
    }
  );
}

// Create Unit Service
async function createUnitService(data) {
  const { plateNumber, bodyNumber, createdBy } = data;

  if (!createdBy) {
    throw {
      status: 400,
      message: "createdBy is required.",
    };
  }

  const plateExists = await Unit.findOne({
    plateNumber,
    deletedAt: null,
  });

  if (plateExists) {
    throw {
      status: 409,
      message: "Plate number already exists.",
    };
  }

  const bodyExists = await Unit.findOne({
    bodyNumber,
    deletedAt: null,
  });

  if (bodyExists) {
    throw {
      status: 409,
      message: "Body number already exists.",
    };
  }

  const unit = new Unit(data);

  await unit.save();

  console.log("FIRST SAVE");

  const unitUrl = `${FRONTEND_URL}/unit/${unit._id}`;

  console.log(unitUrl);

  unit.qrCode = await generateQRCode(unitUrl);

  console.log("QR GENERATED");

  await unit.save();

  console.log("SECOND SAVE");

  return unit;
}
// Get Units Service (pagination, search, filter, sort)
async function getUnitsService({ page = 1, limit = 10, search = '', availabilityStatus, maintenanceStatus }) {
  page = parseInt(page);
  limit = parseInt(limit);
  const query = { deletedAt: null };
  if (availabilityStatus) query.availabilityStatus = availabilityStatus;
  if (maintenanceStatus) query.maintenanceStatus = maintenanceStatus;
  if (search) {
    query.$or = [
      { plateNumber: { $regex: search, $options: 'i' } },
      { bodyNumber: { $regex: search, $options: 'i' } },
    ];
  }
  const units = await Unit.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  const total = await Unit.countDocuments(query);
  return {
    units,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

// Get Single Unit Service
async function getSingleUnitService(id) {

  console.log("SERVICE ID:");
  console.log(id);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw {
      status:400,
      message:"Invalid unit ID."
    };
  }

  const unit = await Unit.findOne({
      _id:id,
      deletedAt:null
  }).populate("driverAssigned");

  console.log("SERVICE RESULT:");
  console.log(unit);

  if(!unit){
      throw {
          status:404,
          message:"Unit not found."
      };
  }

  return unit;
}

// Update Unit Service
async function updateUnitService(id, data) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw { status: 400, message: 'Invalid unit ID.' };
  }
  // Prevent duplicate plate number
  if (data.plateNumber) {
    const plateExists = await Unit.findOne({ plateNumber: data.plateNumber, _id: { $ne: id }, deletedAt: null });
    if (plateExists) {
      throw { status: 409, message: 'Plate number already exists.' };
    }
  }
  // Prevent duplicate body number
  if (data.bodyNumber) {
    const bodyExists = await Unit.findOne({ bodyNumber: data.bodyNumber, _id: { $ne: id }, deletedAt: null });
    if (bodyExists) {
      throw { status: 409, message: 'Body number already exists.' };
    }
  }
  const unit = await Unit.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { $set: data },
    { new: true }
  );
  if (!unit) {
    throw { status: 404, message: 'Unit not found.' };
  }
  return unit;
}

// Soft Delete Unit Service
async function deleteUnitService(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw { status: 400, message: 'Invalid unit ID.' };
  }
  const unit = await Unit.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { $set: { deletedAt: new Date() } },
    { new: true }
  );
  if (!unit) {
    throw { status: 404, message: 'Unit not found.' };
  }
  return { message: 'Unit deleted successfully.' };
}

// Update Unit Availability Status
async function updateUnitAvailabilityService(id, availabilityStatus) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw { status: 400, message: 'Invalid unit ID.' };
  }
  const unit = await Unit.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { $set: { availabilityStatus } },
    { new: true }
  );
  if (!unit) {
    throw { status: 404, message: 'Unit not found.' };
  }
  return unit;
}

// Update Unit Maintenance Status
async function updateUnitMaintenanceService(id, maintenanceStatus) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw { status: 400, message: 'Invalid unit ID.' };
  }
  const unit = await Unit.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { $set: { maintenanceStatus } },
    { new: true }
  );
  if (!unit) {
    throw { status: 404, message: 'Unit not found.' };
  }
  return unit;
}

module.exports = {
    createUnitService,
    getUnitByQRService,
    getUnitsService,
    getSingleUnitService,
    updateUnitService,
    deleteUnitService,
    updateUnitAvailabilityService,
    updateUnitMaintenanceService,
    getUnitsDropdownService
}