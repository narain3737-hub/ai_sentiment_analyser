import {
  createCorrelationId,
  getCurrentUserId,
  getSessionId,
} from "./incidentContext";
import { sanitizeForIncident } from "./sanitize";
import { normalizeSeverity } from "./severity";

export const INCIDENT_ENDPOINT = 'https://kinetic-hardiness-outsource.ngrok-free.dev/api/incidents/collect' ||
  import.meta.env.VITE_INCIDENT_ENDPOINT ||
  "http://localhost:8000/api/incidents/collect";

const PROJECT_NAME =
  import.meta.env.VITE_PROJECT_NAME || "AI Feedback Sentiment Analyzer";

const APP_ENVIRONMENT =
  import.meta.env.VITE_APP_ENVIRONMENT || import.meta.env.MODE || "development";

const DUPLICATE_WINDOW_MS = 8000;
const recentIncidents = new Map();

function createFingerprint(incident) {
  return [
    incident.error_message,
    incident.stacktrace?.split("\n")[0],
    incident.url,
    incident.component,
  ].join("|");
}

function isDuplicate(incident) {
  const fingerprint = createFingerprint(incident);
  const now = Date.now();
  const previousTimestamp = recentIncidents.get(fingerprint);

  if (previousTimestamp && now - previousTimestamp < DUPLICATE_WINDOW_MS) {
    return true;
  }

  recentIncidents.set(fingerprint, now);

  if (recentIncidents.size > 150) {
    const oldestKey = recentIncidents.keys().next().value;

    if (oldestKey) {
      recentIncidents.delete(oldestKey);
    }
  }

  return false;
}

function buildPayload(incident) {
  const correlationId = incident.correlation_id || createCorrelationId();

  return {
    project_name: PROJECT_NAME,
    environment: APP_ENVIRONMENT,
    title: incident.title || "Frontend incident",
    service: incident.service || "frontend",
    severity: normalizeSeverity(incident.severity),
    error_type: incident.error_type || "FrontendError",
    error_code: incident.error_code || "FRONTEND_ERROR",
    error_message: incident.error_message || "Unknown frontend incident",
    timestamp: incident.timestamp || new Date().toISOString(),
    correlation_id: correlationId,
    request_id: incident.request_id || correlationId,
    user_id: incident.user_id || getCurrentUserId(),
    session_id: incident.session_id || getSessionId(),
    module: incident.module || "frontend",
    component: incident.component || "UnknownComponent",
    function_name: incident.function_name || "unknownFunction",
    url: incident.url || window.location.href,
    stacktrace: incident.stacktrace || "",
    metadata: sanitizeForIncident({
      source: incident.metadata?.source || "frontend-monitoring",
      page_url: window.location.href,
      route: window.location.pathname,
      user_agent: navigator.userAgent,
      repository_url: import.meta.env.VITE_REPOSITORY_URL || "",
      git_branch: import.meta.env.VITE_GIT_BRANCH || "main",
      git_commit_sha: import.meta.env.VITE_GIT_COMMIT_SHA || "unknown",
      ...incident.metadata,
    }),
  };
}

export async function reportIncident(incident, options = {}) {
  console.log("incident", incident)
  const payload = buildPayload(incident);

  if (!options.allowDuplicate && isDuplicate(payload)) {
    return {
      ok: true,
      skipped: true,
      reason: "duplicate",
      payload,
    };
  }

  try {
    // Deliberately use fetch instead of the monitored Axios client to avoid
    // recursively reporting a failure from the incident collector itself.
    const response = await fetch(INCIDENT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Incident-Source": "frontend",
        "X-API-Key": "36c89c1f-2592-4b19-836a-d26ba8930567",
      },
      body: JSON.stringify(payload),
      keepalive: true,
    });

    const responseText = await response.text();
    let responseData = responseText;

    if (responseText) {
      try {
        responseData = JSON.parse(responseText);
      } catch {
        // Preserve non-JSON responses for troubleshooting.
      }
    }

    if (!response.ok) {
      console.error("Incident collector rejected the payload", {
        status: response.status,
        response: responseData,
      });
    }

    return {
      ok: response.ok,
      status: response.status,
      data: responseData,
      payload,
    };
  } catch (error) {
    console.error("Incident collector is unavailable", error);

    return {
      ok: false,
      status: 0,
      error,
      payload,
    };
  }
}
