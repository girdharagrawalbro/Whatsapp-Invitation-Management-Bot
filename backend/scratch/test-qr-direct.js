const OpenWAClient = require('../config/openwa');

async function run() {
  const client = new OpenWAClient({ sessionId: '2ded02f9-44bd-4acb-a5f1-4b8a61c20bab' });
  try {
    console.log("Fetching QR from OpenWA server...");
    const qrData = await client.getQRCode('2ded02f9-44bd-4acb-a5f1-4b8a61c20bab');
    console.log("QR Data keys:", Object.keys(qrData));
    console.log("QR Data content sample:", JSON.stringify(qrData).substring(0, 100));
    console.log("Is qr string present?", !!qrData.qr);
    console.log("Is qrCode string present?", !!qrData.qrCode);
  } catch (error) {
    console.error("Failed to fetch QR:", error.message);
  }
}

run();
