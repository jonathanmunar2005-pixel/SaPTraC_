const FuelTransaction = require('../models/fuelTransaction.model');
const Remittance = require('../models/remittance.model');
const Maintenance = require('../models/maintenance.model');
const Driver = require('../models/driver.model');
const Unit = require('../models/unit.model');
const mongoose = require('mongoose');

/**
 * Revenue Analytics
 * - Total revenue, revenue by period, top contributors
 */
async function getRevenueAnalytics({ startDate, endDate } = {}) {
  const match = {};

  if (startDate || endDate) {
    match.createdAt = {};

    if (startDate)
      match.createdAt.$gte = new Date(startDate);

    if (endDate)
      match.createdAt.$lte = new Date(endDate);
  }
  
  const [summary = {}] = await Remittance.aggregate([
  { $match: match },
  {
    $group: {
      _id: null,
      totalRevenue: { $sum: "$cooperativeIncome" },
      remittanceCount: { $sum: 1 },
    },
  },
]);

  const dailyRevenue = await Remittance.aggregate([
    { $match: match },

    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt",
          },
        },

        revenue: {
          $sum: "$cooperativeIncome",
        },
      },
    },

    { $sort: { _id: 1 } },
  ]);

  const weeklyRevenue = await Remittance.aggregate([
    { $match: match },

    {
      $group: {
        _id: {
          $week: "$createdAt",
        },

        revenue: {
          $sum: "$cooperativeIncome",
        },
      },
    },

    { $sort: { _id: 1 } },
  ]);

  const monthlyRevenue = await Remittance.aggregate([
    { $match: match },

    {
      $group: {
        _id: {
          $month: "$createdAt",
        },

        revenue: {
          $sum: "$cooperativeIncome",
        },
      },
    },

    { $sort: { _id: 1 } },
  ]);

  return {
  totalRevenue: summary.totalRevenue || 0,
  remittanceCount: summary.remittanceCount || 0,

  dailyRevenue: dailyRevenue.map((d) => ({
    date: d._id,
    revenue: d.revenue,
  })),

  weeklyRevenue: weeklyRevenue.map((d) => ({
    week: `Week ${d._id}`,
    revenue: d.revenue,
  })),

  monthlyRevenue: monthlyRevenue.map((d) => ({
    month: d._id,
    revenue: d.revenue,
  })),
};
}
/**
 * Fuel Analytics
 * - Total fuel, cost, efficiency, anomalies
 */
async function getFuelAnalytics({ startDate, endDate } = {}) {
  const match = {};
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }
  const pipeline = [
    { $match: match },
    {
      $group: {
        _id: null,
        totalLiters: { $sum: '$liters' },
        totalCost: { $sum: '$amount' },
        avgEfficiency: { $avg: '$fuelEfficiency' },
        transactionCount: { $sum: 1 },
      },
    },
  ];
  const [summary = {}] = await FuelTransaction.aggregate(pipeline);
  return {
    totalLiters: summary.totalLiters || 0,
    totalCost: summary.totalCost || 0,
    avgEfficiency: summary.avgEfficiency || 0,
    transactionCount: summary.transactionCount || 0,
  };
}

/**
 * Maintenance Analytics
 * - Open/closed issues, critical issues, average resolution time
 */
async function getMaintenanceAnalytics({ startDate, endDate } = {}) {
  const match = {};
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }
  const pipeline = [
    { $match: match },
    {
      $facet: {
        total: [{ $count: 'count' }],
        open: [{ $match: { status: { $in: ['Pending', 'Diagnosed', 'In Progress', 'Waiting Parts'] } } }, { $count: 'count' }],
        closed: [{ $match: { status: 'Completed' } }, { $count: 'count' }],
        critical: [{ $match: { priority: 'Critical' } }, { $count: 'count' }],
        avgResolution: [
          { $match: { status: 'Completed', completedAt: { $exists: true } } },
          {
            $project: {
              resolutionTime: { $subtract: ['$completedAt', '$createdAt'] },
            },
          },
          { $group: { _id: null, avgResolutionTime: { $avg: '$resolutionTime' } } },
        ],
      },
    },
  ];
  const [result = {}] = await Maintenance.aggregate(pipeline);
  return {
    total: result.total?.[0]?.count || 0,
    open: result.open?.[0]?.count || 0,
    closed: result.closed?.[0]?.count || 0,
    critical: result.critical?.[0]?.count || 0,
    avgResolutionTime: result.avgResolution?.[0]?.avgResolutionTime || 0,
  };
}

/**
 * Driver Performance Analytics
 * - Total trips, fuel efficiency, remittance, anomalies
 */
async function getDriverPerformanceAnalytics({ driverId, startDate, endDate } = {}) {
  const match = {};
  if (driverId) match.driver = mongoose.Types.ObjectId(driverId);
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }
  // Fuel
  const fuelAgg = await FuelTransaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$driver',
        totalFuel: { $sum: '$liters' },
        avgEfficiency: { $avg: '$fuelEfficiency' },
        transactionCount: { $sum: 1 },
      },
    },
  ]);
  // Remittance
  const remitAgg = await Remittance.aggregate([
    { $match: driverId ? { driver: mongoose.Types.ObjectId(driverId) } : {} },
    {
      $group: {
        _id: '$driver',
        totalRemittance: { $sum: '$cooperativeIncome' },
        remittanceCount: { $sum: 1 },
      },
    },
  ]);
  return {
    fuel: fuelAgg[0] || {},
    remittance: remitAgg[0] || {},
  };
}

/**
 * Remittance Analytics
 * - Trends, negative balances, top earners
 */
async function getRemittanceAnalytics({ startDate, endDate } = {}) {
  const match = {};
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }
  // Trend: group by day
  const trend = await Remittance.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        total: { $sum: '$cooperativeIncome' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  // Negative balances
  const negatives = await Remittance.aggregate([
    { $match: { ...match, hasNegativeBalance: true } },
    { $count: 'count' },
  ]);
  // Top earners
  const topDrivers = await Remittance.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$driver',
        total: { $sum: '$cooperativeIncome' },
      },
    },
    { $sort: { total: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'drivers',
        localField: '_id',
        foreignField: '_id',
        as: 'driver',
      },
    },
    { $unwind: '$driver' },
  ]);
  return {
    trend,
    negativeCount: negatives[0]?.count || 0,
    topDrivers,
  };
}

/**
 * Unit Availability Analytics
 * - Count by status
 */
async function getUnitAvailabilityAnalytics() {
  const pipeline = [
    {
      $group: {
        _id: '$availabilityStatus',
        count: { $sum: 1 },
      },
    },
  ];
  const summary = await Unit.aggregate(pipeline);
  return summary.reduce((acc, cur) => {
    acc[cur._id] = cur.count;
    return acc;
  }, {});
}

/**
 * Dashboard Summary
 * - Combines all analytics for dashboard
 */
async function getDashboardSummary({ startDate, endDate } = {}) {
  const [
    revenue,
    fuel,
    maintenance,
    remittance,
    unitAvailability,
  ] = await Promise.all([
    getRevenueAnalytics({ startDate, endDate }),
    getFuelAnalytics({ startDate, endDate }),
    getMaintenanceAnalytics({ startDate, endDate }),
    getRemittanceAnalytics({ startDate, endDate }),
    getUnitAvailabilityAnalytics(),
  ]);

  const activeDrivers = await Driver.countDocuments({
    status: "Active",
  });

  return {
    totalRevenue: revenue.totalRevenue || 0,
    totalRemittance: revenue.remittanceCount || 0,

    totalFuelCost: fuel.totalCost || 0,

    activeDrivers,

    activeUnits: unitAvailability.Available || 0,

    maintenanceIncidents: maintenance.total || 0,
  };
}

module.exports = {
  getRevenueAnalytics,
  getFuelAnalytics,
  getMaintenanceAnalytics,
  getDriverPerformanceAnalytics,
  getRemittanceAnalytics,
  getUnitAvailabilityAnalytics,
  getDashboardSummary,
};
