const axios = require('axios');
const signature = require('cookie-signature');
require('dotenv').config();

async function run() {
  const sessionId = 'HV_1DPdrzWYrcsF-kI32qTKAC_lx44JI';
  const secret = process.env.SESSION_SECRET || 'whatsapp-bot-secret-key-change-in-production';
  const signed = 's:' + signature.sign(sessionId, secret);
  
  try {
    console.log("Fetching status...");
    const statusRes = await axios.get('http://localhost:3000/api/openwa-session/status', {
      headers: { 'Cookie': `connect.sid=${encodeURIComponent(signed)}` }
    });
    console.log("Status response:", statusRes.data);
    
    console.log("Fetching QR code...");
    const qrRes = await axios.get('http://localhost:3000/api/openwa-session/qr', {
      headers: { 'Cookie': `connect.sid=${encodeURIComponent(signed)}` }
    });
    console.log("QR response keys:", Object.keys(qrRes.data));
    console.log("QR value sample:", qrRes.data.qr ? qrRes.data.qr.substring(0, 100) : "UNDEFINED");
  } catch (error) {
    console.error("Error:", error.message);
  }
}

run();
