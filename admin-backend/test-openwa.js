const OpenWASessionManager = require('./helpers/openwaSessionManager').OpenWASessionManager;

async function test() {
  const manager = new OpenWASessionManager();
  try {
    const sessions = await manager.listSessions();
    console.log("Sessions:", sessions);
    if (sessions.length > 0) {
      console.log("Starting session:", sessions[0].id);
      await manager.startSession(sessions[0].id);
    } else {
      console.log("No sessions found, creating one");
      const created = await manager.createSession("TestSession");
      console.log("Created:", created);
      await manager.startSession(created.sessionId);
    }
  } catch (e) {
    console.error("Full Error:", e);
    if (e.response) {
      console.error("Response Data:", e.response.data);
      console.error("Response Status:", e.response.status);
    }
  }
}

test();
