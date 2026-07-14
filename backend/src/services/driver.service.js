console.log("ENV FRONTEND_URL:", process.env.FRONTEND_URL);
const FRONTEND_URL = process.env.FRONTEND_URL;
const Driver = require('../models/driver.model');
const mongoose = require('mongoose');
const generateQRCode = require('../utils/generateQRCode');

// Create Driver Service
async function createDriverService(data) {
  const { email, licenseNumber, firstName, lastName, middleName, profileImage, documents } = data;
  // Check for duplicate email
  const emailExists = await Driver.findOne({ email, deletedAt: null });
  if (emailExists) {
    throw { status: 409, message: 'Email already exists.' };
  }
  // Check for duplicate license number
  const licenseExists = await Driver.findOne({ licenseNumber, deletedAt: null });
  if (licenseExists) {
    throw { status: 409, message: 'License number already exists.' };
  }
  const driver = new Driver(data);
  // If file uploads present, set fields
  if (profileImage) driver.profileImage = profileImage;
  if (documents && Array.isArray(documents) && documents.length > 0) driver.documents = documents;
 await driver.save();

const driverUrl = `${FRONTEND_URL}/driver/${driver._id}`;

console.log("========== DRIVER QR ==========");
console.log("FRONTEND_URL:", FRONTEND_URL);
console.log("QR URL:", driverUrl);
console.log("===============================");

driver.qrCode = await generateQRCode(driverUrl);

await driver.save();

return driver;
}
async function getDriverByQRService(code) {
  let payload;

  try {
  payload = JSON.parse(code);
} catch {
  if (code.includes("/driver/")) {
    const id = code.split("/driver/")[1];

    const driver = await Driver.findById(id);

    if (!driver) {
      throw {
        status: 404,
        message: "Driver not found"
      };
    }

    return driver;
  }

  throw {
    status: 400,
    message: "Invalid QR Code"
  };
}
  return driver;
}

async function getDriversDropdownService() {
  return Driver.find(
    {
      deletedAt: null,
      status: "Active",
    },
    {
      firstName: 1,
      middleName: 1,
      lastName: 1,
    }
  );
}

// Get Drivers Service (pagination, search, filter, sort)
async function getDriversService({ page = 1, limit = 1000, search = '', status }) {
  page = parseInt(page);
  limit = parseInt(limit);
  const query = { deletedAt: null };
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { licenseNumber: { $regex: search, $options: 'i' } },
    ];
  }
  const drivers = await Driver.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  const total = await Driver.countDocuments(query);
  return {
    drivers,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

// Get Single Driver Service
async function getSingleDriverService(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw { status: 400, message: 'Invalid driver ID.' };
  }
  const driver = await Driver.findOne({ _id: id, deletedAt: null });
  if (!driver) {
    throw { status: 404, message: 'Driver not found.' };
  }
  return driver;
}

// Update Driver Service
async function updateDriverService(id, data) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw { status: 400, message: 'Invalid driver ID.' };
  }
  // Prevent duplicate email
  if (data.email) {
    const emailExists = await Driver.findOne({ email: data.email, _id: { $ne: id }, deletedAt: null });
    if (emailExists) {
      throw { status: 409, message: 'Email already exists.' };
    }
  }
  // Prevent duplicate license number
  if (data.licenseNumber) {
    const licenseExists = await Driver.findOne({ licenseNumber: data.licenseNumber, _id: { $ne: id }, deletedAt: null });
    if (licenseExists) {
      throw { status: 409, message: 'License number already exists.' };
    }
  }
  const updateData = { ...data };
  // If file uploads present, set fields
  if (data.profileImage) updateData.profileImage = data.profileImage;
  if (data.documents && Array.isArray(data.documents) && data.documents.length > 0) updateData.documents = data.documents;
  const driver = await Driver.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { $set: updateData },
    { new: true }
  );
  if (!driver) {
    throw { status: 404, message: 'Driver not found.' };
  }
  return driver;
}

// Soft Delete Driver Service
async function deleteDriverService(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw { status: 400, message: 'Invalid driver ID.' };
  }
  const driver = await Driver.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { $set: { deletedAt: new Date() } },
    { new: true }
  );
  if (!driver) {
    throw { status: 404, message: 'Driver not found.' };
  }
  return { message: 'Driver deleted successfully.' };
}

// Update Driver Status Service
async function updateDriverStatusService(id, status) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw { status: 400, message: 'Invalid driver ID.' };
  }
  const driver = await Driver.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { $set: { status } },
    { new: true }
  );
  if (!driver) {
    throw { status: 404, message: 'Driver not found.' };
  }
  return driver;
}

module.exports = {
  createDriverService,
  getDriverByQRService,
  getDriversService,
  getSingleDriverService,
  updateDriverService,
  deleteDriverService,
  updateDriverStatusService,
  getDriversDropdownService,
};