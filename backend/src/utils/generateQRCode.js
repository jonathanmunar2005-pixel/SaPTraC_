const QRCode = require("qrcode");

async function generateQRCode(url) {
  try {
    return await QRCode.toDataURL(url, {
      errorCorrectionLevel: "H",
    });

  } catch (err) {
    throw new Error("Failed to generate QR code: " + err.message);
  }
}

module.exports = generateQRCode;
