const Schedule = require('../models/schedule.model');
const ScheduleHistory = require('../models/scheduleHistory.model');
const mongoose = require('mongoose');
const { emitScheduleEvent } = require('../socket/socket');
const User = require('../models/User');
const { createNotification } = require('./notification.service');

// Helper: Build query for filtering
function buildScheduleQuery({ status, date, driver, unit, scheduleType, relieverDriver, conflictDetected }) {
  const query = { deletedAt: null };
  if (status) query.status = status;
  if (date) query.shiftDate = date;
  if (driver) query.driver = driver;
  if (unit) query.unit = unit;
  if (scheduleType) query.scheduleType = scheduleType;
  if (relieverDriver) query.relieverDriver = relieverDriver;
  if (typeof conflictDetected === 'boolean') query.conflictDetected = conflictDetected;
  return query;
}

// Helper: Check for overlapping schedules
async function hasScheduleConflict({ driver, unit, shiftDate, shiftStart, shiftEnd, excludeId = null }) {
  const conflictQuery = {
    deletedAt: null,
    shiftDate,
    $or: [
      { driver },
      { unit },
    ],
    status: { $in: ['Scheduled', 'Active'] },
    $expr: {
      $and: [
        { $lt: [ '$shiftStart', shiftEnd ] },
        { $gt: [ '$shiftEnd', shiftStart ] },
      ],
    },
  };
  if (excludeId) conflictQuery._id = { $ne: excludeId };
  const conflict = await Schedule.findOne(conflictQuery);
  return !!conflict;
}

// Helper: Log schedule history (scalable, audit-trail)
async function logScheduleHistory({ schedule, actionType, performedBy, previousData, newData }) {
  try {
    await ScheduleHistory.create({
      schedule: schedule._id || schedule,
      actionType,
      performedBy,
      previousData,
      newData,
    });
  } catch (err) {
    // Optionally log error, but do not block main flow
    console.error('Failed to log schedule history:', err);
  }
}

// Create Schedule
async function createScheduleService(data, performedBy) {
  const { driver, unit, shiftDate, shiftStart, shiftEnd, relieverDriver } = data;
  if (!driver || !unit || !shiftDate || !shiftStart || !shiftEnd) {
    throw new Error('Missing required schedule fields.');
  }
  // Check for conflicts
  const conflict = await hasScheduleConflict({ driver, unit, shiftDate, shiftStart, shiftEnd });
  if (conflict) {
    // Notify assignedBy (performedBy) about conflict
    if (performedBy) {
      await createNotification({
        recipient: performedBy,
        title: 'Schedule Conflict Detected',
        message: 'A schedule conflict was detected for the selected driver or unit.',
        type: 'ConflictDetected',
      });
    }
    throw new Error('Schedule conflict detected: driver or unit already assigned at this time.');
  }
  // Create schedule
  const schedule = new Schedule(data);
  await schedule.save();
  emitScheduleEvent('scheduleCreated', schedule);
  // Log history
  await logScheduleHistory({
    schedule,
    actionType: 'Created',
    performedBy,
    previousData: null,
    newData: schedule.toObject(),
  });
  // Notify driver (and reliever if present)
  const driverUser = await User.findOne({ email: schedule.driver.email });
  if (driverUser) {
    await createNotification({
      recipient: driverUser._id,
      title: 'New Schedule Assigned',
      message: `You have been assigned a new schedule on ${schedule.shiftDate.toISOString().slice(0,10)}.`,
      type: 'ScheduleAssigned',
    });
  }
  if (schedule.relieverDriver) {
    const relieverUser = await User.findOne({ email: schedule.relieverDriver.email });
    if (relieverUser) {
      await createNotification({
        recipient: relieverUser._id,
        title: 'Reliever Schedule Assigned',
        message: `You have been assigned as a reliever driver on ${schedule.shiftDate.toISOString().slice(0,10)}.`,
        type: 'ScheduleAssigned',
      });
    }
  }
  return schedule;
}

// Get Schedules (pagination, filter, sort)
async function getSchedulesService({ page = 1, limit = 10, ...filters }) {
  page = parseInt(page);
  limit = parseInt(limit);
  const query = buildScheduleQuery(filters);
  const sort = { createdAt: -1 };
  const total = await Schedule.countDocuments(query);
  const schedules = await Schedule.find(query)
  .sort(sort)
  .skip((page - 1) * limit)
  .limit(limit)
  .populate('driver')
  .populate('unit');
  return {
    schedules,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

// Get Single Schedule
async function getSingleScheduleService(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid schedule ID.');
  const schedule = await Schedule.findOne({ _id: id, deletedAt: null })
    .populate('driver unit relieverDriver assignedBy');
  if (!schedule) throw new Error('Schedule not found.');
  return schedule;
}

// Update Schedule
async function updateScheduleService(id, data, performedBy) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid schedule ID.');
  const schedule = await Schedule.findOne({ _id: id, deletedAt: null });
  if (!schedule) throw new Error('Schedule not found.');
  // If updating driver/unit/time, check for conflicts
  const updateFields = ['driver', 'unit', 'shiftDate', 'shiftStart', 'shiftEnd'];
  const needsConflictCheck = updateFields.some(f => data[f] && data[f] !== schedule[f]);
  if (needsConflictCheck) {
    const conflict = await hasScheduleConflict({
      driver: data.driver || schedule.driver,
      unit: data.unit || schedule.unit,
      shiftDate: data.shiftDate || schedule.shiftDate,
      shiftStart: data.shiftStart || schedule.shiftStart,
      shiftEnd: data.shiftEnd || schedule.shiftEnd,
      excludeId: id,
    });
    if (conflict) throw new Error('Schedule conflict detected: driver or unit already assigned at this time.');
  }
  const previousData = schedule.toObject();
  Object.assign(schedule, data);
  await schedule.save();
  emitScheduleEvent('scheduleUpdated', schedule);
  // Log history
  await logScheduleHistory({
    schedule,
    actionType: 'Updated',
    performedBy,
    previousData,
    newData: schedule.toObject(),
  });
  // If status changed to Cancelled, notify driver
  if (data.status === 'Cancelled') {
    const driverUser = await User.findOne({ email: schedule.driver.email });
    if (driverUser) {
      await createNotification({
        recipient: driverUser._id,
        title: 'Schedule Cancelled',
        message: `Your schedule on ${schedule.shiftDate.toISOString().slice(0,10)} has been cancelled.`,
        type: 'ScheduleCancelled',
      });
    }
  }
  return schedule;
}

// Soft Delete Schedule
async function deleteScheduleService(id, performedBy) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid schedule ID.');
  const schedule = await Schedule.findOne({ _id: id, deletedAt: null });
  if (!schedule) throw new Error('Schedule not found.');
  const previousData = schedule.toObject();
  schedule.deletedAt = new Date();
  await schedule.save();
  emitScheduleEvent('scheduleDeleted', { _id: schedule._id });
  // Log history
  await logScheduleHistory({
    schedule,
    actionType: 'Deleted',
    performedBy,
    previousData,
    newData: schedule.toObject(),
  });
  // Notify driver about cancellation
  const driverUser = await User.findOne({ email: schedule.driver.email });
  if (driverUser) {
    await createNotification({
      recipient: driverUser._id,
      title: 'Schedule Cancelled',
      message: `Your schedule on ${schedule.shiftDate.toISOString().slice(0,10)} has been cancelled.`,
      type: 'ScheduleCancelled',
    });
  }
  return { message: 'Schedule deleted (soft delete).' };
}

// Replace Driver (Reliever)
async function replaceDriverService(id, relieverDriverId, performedBy) {
  if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(relieverDriverId)) {
    throw new Error('Invalid schedule or driver ID.');
  }
  const schedule = await Schedule.findOne({ _id: id, deletedAt: null });
  if (!schedule) throw new Error('Schedule not found.');
  // Check for conflicts for reliever
  const conflict = await hasScheduleConflict({
    driver: relieverDriverId,
    unit: schedule.unit,
    shiftDate: schedule.shiftDate,
    shiftStart: schedule.shiftStart,
    shiftEnd: schedule.shiftEnd,
    excludeId: id,
  });
  if (conflict) throw new Error('Reliever driver has a conflicting schedule.');
  const previousData = schedule.toObject();
  schedule.relieverDriver = relieverDriverId;
  schedule.scheduleType = 'Reliever';
  await schedule.save();
  emitScheduleEvent('driverReplaced', schedule);
  // Log history
  await logScheduleHistory({
    schedule,
    actionType: 'DriverReplaced',
    performedBy,
    previousData,
    newData: schedule.toObject(),
  });
  // Notify reliever driver
  const relieverUser = await User.findOne({ email: schedule.relieverDriver.email });
  if (relieverUser) {
    await createNotification({
      recipient: relieverUser._id,
      title: 'Reliever Assignment',
      message: `You have been assigned as a reliever driver on ${schedule.shiftDate.toISOString().slice(0,10)}.`,
      type: 'DriverReplaced',
    });
  }
  return schedule;
}

// Status Change (utility for audit trail)
async function logStatusChange(schedule, oldStatus, newStatus, performedBy) {
  if (oldStatus !== newStatus) {
    await logScheduleHistory({
      schedule,
      actionType: 'StatusChanged',
      performedBy,
      previousData: { status: oldStatus },
      newData: { status: newStatus },
    });
  }
}

module.exports = {
  createScheduleService,
  getSchedulesService,
  getSingleScheduleService,
  updateScheduleService,
  deleteScheduleService,
  replaceDriverService,
  logStatusChange, // Export for controller use if needed
};
