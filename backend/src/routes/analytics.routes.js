const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');

// Only Super Admin and Administrator can access analytics
const adminRoles = ['Super Admin', 'Administrator', 'Operational Manager'];

// Dashboard Summary
router.get(
  '/dashboard',
  verifyToken,
  authorizeRoles(...adminRoles),
  analyticsController.getDashboard
);

// Revenue Analytics
router.get(
  '/revenue',
  verifyToken,
  authorizeRoles(...adminRoles),
  analyticsController.getRevenue
);

// Fuel Analytics
router.get(
  '/fuel',
  verifyToken,
  authorizeRoles(...adminRoles),
  analyticsController.getFuel
);

// Maintenance Analytics
router.get(
  '/maintenance',
  verifyToken,
  authorizeRoles(...adminRoles),
  analyticsController.getMaintenance
);

// Driver Performance Analytics
router.get(
  '/drivers',
  verifyToken,
  authorizeRoles(...adminRoles),
  analyticsController.getDrivers
);

// Remittance Analytics
router.get(
  '/remittances',
  verifyToken,
  authorizeRoles(...adminRoles),
  analyticsController.getRemittances
);

// Unit Availability Analytics
router.get(
  '/units',
  verifyToken,
  authorizeRoles(...adminRoles),
  analyticsController.getUnits
);

module.exports = router;
