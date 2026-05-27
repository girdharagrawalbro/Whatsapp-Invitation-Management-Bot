const OpenWAClient = require('../config/openwa');

async function run() {
  const client = new OpenWAClient({ sessionId: '2ded02f9-44bd-4acb-a5f1-4b8a61c20bab' });
  try {
    console.log("Checking session status directly...");
    const status = await client.getSessionStatus('2ded02f9-44bd-4acb-a5f1-4b8a61c20bab');
    console.log("Status Success:", status);
  } catch (error) {
    console.error("Status Failed. Message:", error.message);
    if (error.response) {
      console.error("Status Code:", error.response.status);
      console.error("Data:", error.response.data);
    }
  }
}

run();
