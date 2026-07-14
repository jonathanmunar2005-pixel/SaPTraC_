const Maintenance = require('../models/maintenance.model');
const Unit = require('../models/unit.model');
const mongoose = require('mongoose');
const { logRepairHistory } = require('./repairHistory.service');
const {
  notifyMechanicAssignment,
  notifyAdminsOnCritical,
  notifyMaintenanceCompleted,
  notifyStatusChange,
} = require('./notification.service');

const DEFAULT_RECURRENCE_THRESHOLD = 3; // Can be overridden via options or env

/**
 * Detects recurring issues for a unit and issue category.
 * @param {ObjectId} unitId - The unit ObjectId
 * @param {String} issueCategory - The issue category string
 * @param {Number} threshold - The minimum number of recurrences to flag
 * @returns {Promise<{detected: boolean, count: number}>}
 */
async function detectRecurringIssue(unitId, issueCategory, threshold = DEFAULT_RECURRENCE_THRESHOLD) {
  const filter = {
    unit: unitId,
    deletedAt: null,
  };
  if (issueCategory) filter.issueCategory = issueCategory;
  const count = await Maintenance.countDocuments(filter);
  return {
    detected: count + 1 >= threshold, // +1 for the new issue being created
    count: count + 1,
  };
}

/**
 * Analytics: Get recurring issue stats grouped by unit and/or category
 * @param {Object} options - { groupBy: 'unit' | 'category' | 'unit-category', minCount: number }
 * @returns {Promise<Array>}
 */
async function getRecurringIssueAnalytics({ groupBy = 'unit-category', minCount = DEFAULT_RECURRENCE_THRESHOLD } = {}) {
  const groupStage = (() => {
    if (groupBy === 'unit') return { _id: '$unit', count: { $sum: 1 } };
    if (groupBy === 'category') return { _id: '$issueCategory', count: { $sum: 1 } };
    return { _id: { unit: '$unit', issueCategory: '$issueCategory' }, count: { $sum: 1 } };
  })();
  return Maintenance.aggregate([
    { $match: { deletedAt: null } },
    { $group: groupStage },
    { $match: { count: { $gte: minCount } } },
    { $sort: { count: -1 } },
  ]);
}

// Create Maintenance Record
async function createMaintenanceService(data, { recurrenceThreshold = DEFAULT_RECURRENCE_THRESHOLD } = {}) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Detect recurring issue BEFORE creation
    const { detected, count } = await detectRecurringIssue(
      data.unit,
      data.issueCategory,
      recurrenceThreshold
    );
    // Attach recurring issue fields
    data.recurringIssueDetected = detected;
    data.recurringIssueCount = count;

    if (!data.reportedDate) {
    data.reportedDate = new Date();
 }

    const maintenance = await Maintenance.create([data], { session });
    // Set unit availability to 'Under Maintenance' when maintenance is created
    await Unit.findOneAndUpdate(
      { _id: data.unit, deletedAt: null },
      { $set: { availabilityStatus: 'Under Maintenance' } },
      { session }
    );
    // Log repair history: IssueCreated
    await logRepairHistory({
    maintenance: maintenance[0]._id,
    actionType: "IssueCreated",
    performedBy: data.reportedBy,
    newData: maintenance[0],
    notes: "Maintenance record created."
});
    // Notify admins if critical issue
    if (data.priorityLevel === 'Critical') {
      await notifyAdminsOnCritical({ maintenance: maintenance[0] });
    }
    await session.commitTransaction();
    return maintenance[0];
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

// Get Maintenance Records (pagination, search, filter, status, priority, mechanic)
async function getMaintenanceService({
  page = 1,
  limit = 10,
  search = '',
  maintenanceStatus,
  priorityLevel,
  assignedMechanic,
  unit,
  maintenanceType,
  sort = 'desc',
}) {
  page = parseInt(page);
  limit = parseInt(limit);
  const query = { deletedAt: null };
  if (maintenanceStatus) query.maintenanceStatus = maintenanceStatus;
  if (priorityLevel) query.priorityLevel = priorityLevel;
  if (assignedMechanic) query.assignedMechanic = assignedMechanic;
  if (unit) query.unit = unit;
  if (maintenanceType) query.maintenanceType = maintenanceType;
  if (search) {
    query.$or = [
      { issueTitle: { $regex: search, $options: 'i' } },
      { issueDescription: { $regex: search, $options: 'i' } },
      { issueCategory: { $regex: search, $options: 'i' } },
    ];
  }
  const total = await Maintenance.countDocuments(query);
  const maintenances = await Maintenance.find(query)
    .populate('unit reportedBy assignedMechanic')
    .sort({ createdAt: sort === 'asc' ? 1 : -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  return {
    maintenances,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

// Get Single Maintenance Record
async function getSingleMaintenanceService(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw { status: 400, message: 'Invalid maintenance ID.' };
  }
  const maintenance = await Maintenance.findOne({ _id: id, deletedAt: null })
    .populate('unit reportedBy assignedMechanic');
  if (!maintenance) {
    throw { status: 404, message: 'Maintenance record not found.' };
  }
  return maintenance;
}

// Update Maintenance Record
async function updateMaintenanceService(id, data, performedBy) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw { status: 400, message: "Invalid maintenance ID." };
  }

  const prev = await Maintenance.findOne({
    _id: id,
    deletedAt: null,
  });

  const maintenance = await Maintenance.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { $set: data },
    { new: true }
  );

  if (!maintenance) {
    throw { status: 404, message: "Maintenance record not found." };
  }

  // Status Updated
  if (
    data.maintenanceStatus &&
    data.maintenanceStatus !== prev.maintenanceStatus
  ) {
    await logRepairHistory({
      maintenance: id,
      actionType: "StatusUpdated",
      performedBy,
      previousData: {
        maintenanceStatus: prev.maintenanceStatus,
      },
      newData: {
        maintenanceStatus: data.maintenanceStatus,
      },
      notes: data.statusNotes || "",
    });
  }

  // Parts replaced
  if (data.partsReplaced) {
    await logRepairHistory({
      maintenance: id,
      actionType: "PartsReplaced",
      performedBy,
      previousData: {
        partsReplaced: prev.partsReplaced,
      },
      newData: {
        partsReplaced: data.partsReplaced,
      },
      notes: data.partsNotes || "",
    });
  }

  // Maintenance notes
  if (data.maintenanceNotes) {
    await logRepairHistory({
      maintenance: id,
      actionType: "MaintenanceNoteAdded",
      performedBy,
      newData: {
        maintenanceNotes: data.maintenanceNotes,
      },
      notes: data.maintenanceNotes,
    });
  }

  return maintenance;
}

// Soft Delete Maintenance Record
async function deleteMaintenanceService(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw { status: 400, message: 'Invalid maintenance ID.' };
  }
  const maintenance = await Maintenance.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { $set: { deletedAt: new Date() } },
    { new: true }
  );
  if (!maintenance) {
    throw { status: 404, message: 'Maintenance record not found.' };
  }
  return { message: 'Maintenance record deleted successfully.' };
}

// Update Maintenance Status (and update unit availability if needed)
async function updateMaintenanceStatusService(id, maintenanceStatus, performedBy) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw { status: 400, message: 'Invalid maintenance ID.' };
  }
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const prev = await Maintenance.findOne({ _id: id, deletedAt: null });
    const maintenance = await Maintenance.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: { maintenanceStatus } },
      { new: true, session }
    );
    if (!maintenance) {
      throw { status: 404, message: 'Maintenance record not found.' };
    }
    // If status is 'In Progress', set unit availability to 'Under Maintenance'
    if (maintenanceStatus === 'In Progress') {
      await Unit.findOneAndUpdate(
        { _id: maintenance.unit, deletedAt: null },
        { $set: { availabilityStatus: 'Under Maintenance' } },
        { session }
      );
    }
    // If status is 'Completed', set unit availability to 'Available'
    if (maintenanceStatus === 'Completed') {
      await Unit.findOneAndUpdate(
        { _id: maintenance.unit, deletedAt: null },
        { $set: { availabilityStatus: 'Available' } },
        { session }
      );
    }
    // Log repair history: StatusUpdated, RepairCompleted
  if (
  maintenanceStatus === "In Progress" &&
  prev.maintenanceStatus !== "In Progress"
) {
  await logRepairHistory({
    maintenance: id,
    actionType: "RepairStarted",
    performedBy,
    previousData: prev,
    newData: maintenance,
    notes: "Repair started.",
  });
}
    // Notify on status change
    await notifyStatusChange({ maintenance, newStatus: maintenanceStatus });
    if (maintenanceStatus === 'Completed') {
      await logRepairHistory({
        maintenance: id,
        actionType: 'RepairCompleted',
        performedBy,
        previousData: prev,
        newData: maintenance,
        notes: 'Repair marked as completed.',
      });
      // Notify on completion
      await notifyMaintenanceCompleted({ maintenance });
    }
    await session.commitTransaction();
    return maintenance;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

// Assign Mechanic to Maintenance
async function assignMechanicService(id, mechanicId, performedBy) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw { status: 400, message: 'Invalid maintenance ID.' };
  }
  if (!mongoose.Types.ObjectId.isValid(mechanicId)) {
    throw { status: 400, message: 'Invalid mechanic ID.' };
  }
  const prev = await Maintenance.findOne({ _id: id, deletedAt: null });
  const maintenance = await Maintenance.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { $set: { assignedMechanic: mechanicId } },
    { new: true }
  );
  if (!maintenance) {
    throw { status: 404, message: 'Maintenance record not found.' };
  }
  // Log repair history: MechanicAssigned
  await logRepairHistory({
    maintenance: id,
    actionType: 'MechanicAssigned',
    performedBy,
    previousData: { assignedMechanic: prev.assignedMechanic },
    newData: { assignedMechanic: mechanicId },
    notes: '',
  });
  // Notify mechanic on assignment
  await notifyMechanicAssignment({ mechanicId, maintenance });
  return maintenance;
}

module.exports = {
  createMaintenanceService,
  getMaintenanceService,
  getSingleMaintenanceService,
  updateMaintenanceService,
  deleteMaintenanceService,
  updateMaintenanceStatusService,
  assignMechanicService,
  // Recurring issue detection and analytics exports
  detectRecurringIssue,
  getRecurringIssueAnalytics,
};
