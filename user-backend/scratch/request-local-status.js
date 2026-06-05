const axios = require('axios');
const signature = require('cookie-signature');
require('dotenv').config();

async function run() {
  const sessionId = 'HV_1DPdrzWYrcsF-kI32qTKAC_lx44JI';
  const secret = process.env.SESSION_SECRET || 'whatsapp-bot-secret-key-change-in-production';
  
  // Sign the session ID
  const signed = 's:' + signature.sign(sessionId, secret);
  console.log("Signed cookie value:", signed);
  
  try {
    const response = await axios.get('http://localhost:3000/api/openwa-session/status', {
      headers: {
        'Cookie': `connect.sid=${encodeURIComponent(signed)}`
      }
    });
    console.log("Response status:", response.status);
    console.log("Response data:", response.data);
  } catch (error) {
    console.error("Request failed!");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Headers:", error.response.headers);
      console.error("Body:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error("Error message:", error.message);
    }
  }
}

run();
