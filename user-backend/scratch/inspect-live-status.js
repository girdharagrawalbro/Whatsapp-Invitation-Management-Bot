const OpenWAClient = require('../config/openwa');

async function run() {
  const client = new OpenWAClient({ sessionId: '2ded02f9-44bd-4acb-a5f1-4b8a61c20bab' });
  try {
    console.log("Checking live status directly from OpenWA server...");
    const status = await client.getSessionStatus('2ded02f9-44bd-4acb-a5f1-4b8a61c20bab');
    console.log("Live status data:", status);
  } catch (error) {
    console.error("Failed:", error.message);
  }
}

run();
