const express = require('express');
const router = express.Router();
const fuelController = require('../controllers/fuel.controller');
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');

// Only Super Admin, Administrator, and Fuel Pump Attendant can access fuel endpoints
const allowedRoles = ['Super Admin', 'Administrator', 'Fuel Pump Attendant'];

// Create Fuel Transaction
router.post(
  '/',
  verifyToken,
  authorizeRoles(...allowedRoles),
  fuelController.createFuelTransaction
);

// Get Fuel Transactions (list)
router.get(
  '/',
  verifyToken,
  authorizeRoles(...allowedRoles),
  fuelController.getFuelTransactions
);

// Get Single Fuel Transaction
router.get(
  '/:id',
  verifyToken,
  authorizeRoles(...allowedRoles),
  fuelController.getSingleFuelTransaction
);

// Update Fuel Transaction
router.put(
  '/:id',
  verifyToken,
  authorizeRoles(...allowedRoles),
  fuelController.updateFuelTransaction
);

// Delete Fuel Transaction (soft delete)
router.delete(
  '/:id',
  verifyToken,
  authorizeRoles(...allowedRoles),
  fuelController.deleteFuelTransaction
);

module.exports = router;
