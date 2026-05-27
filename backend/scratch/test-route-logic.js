const { getSessionManager } = require('../helpers/openwaSessionManager');

async function resolveOrgSession(manager, orgId) {
  const sessionName = `Org-${orgId}`;
  let sessionId = await manager.findSessionIdByName(sessionName);

  if (!sessionId) {
    try {
      const created = await manager.createSession(sessionName);
      sessionId = created.sessionId || created.id || null;
    } catch (error) {
      // If the session already exists remotely, try resolving it again by name.
      sessionId = await manager.findSessionIdByName(sessionName);
      if (!sessionId) {
        throw error;
      }
    }
  }

  if (!sessionId) {
    throw new Error(`OpenWA session not found for ${sessionName}`);
  }

  return { sessionId, sessionName };
}

async function run() {
  const orgId = '6a169d671462530bcc795044';
  const manager = getSessionManager();
  try {
    console.log("Resolving org session for:", orgId);
    const { sessionId } = await resolveOrgSession(manager, orgId);
    console.log("Resolved sessionId:", sessionId);
    
    console.log("Checking status...");
    const status = await manager.checkStatus(sessionId);
    console.log("Status check result:", status);
  } catch (error) {
    console.error("Failed with error:", error);
  }
}

run();
