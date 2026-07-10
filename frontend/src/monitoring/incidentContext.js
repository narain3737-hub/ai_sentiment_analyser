const SESSION_STORAGE_KEY = "incident_monitoring_session_id";

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createCorrelationId() {
  return createId();
}

export function getSessionId() {
  try {
    const existingSessionId = sessionStorage.getItem(SESSION_STORAGE_KEY);

    if (existingSessionId) {
      return existingSessionId;
    }

    const newSessionId = createId();
    sessionStorage.setItem(SESSION_STORAGE_KEY, newSessionId);
    return newSessionId;
  } catch {
    return createId();
  }
}

function extractUserId(value) {
  if (!value || typeof value !== "object") {
    return "";
  }

  const userId = value.id ?? value.user_id ?? value.userId;
  return userId === null || userId === undefined ? "" : String(userId);
}

export function getCurrentUserId() {
  const candidateKeys = ["authUser", "currentUser", "user"];

  for (const key of candidateKeys) {
    try {
      const storedValue = localStorage.getItem(key);

      if (!storedValue) {
        continue;
      }

      const userId = extractUserId(JSON.parse(storedValue));

      if (userId) {
        return userId;
      }
    } catch {
      // Ignore malformed or unavailable local storage values.
    }
  }

  return "";
}
