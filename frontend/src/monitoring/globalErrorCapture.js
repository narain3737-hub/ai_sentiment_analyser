import { reportIncident } from "./incidentReporter";
import { INCIDENT_SEVERITIES } from "./severity";

let cleanupHandler = null;

function normalizeRejectedReason(reason) {
  if (reason instanceof Error) {
    return {
      errorType: reason.name || "Error",
      errorMessage: reason.message || "Unhandled promise rejection",
      stacktrace: reason.stack || "",
    };
  }

  if (typeof reason === "string") {
    return {
      errorType: "UnhandledPromiseRejection",
      errorMessage: reason,
      stacktrace: "",
    };
  }

  try {
    return {
      errorType: "UnhandledPromiseRejection",
      errorMessage: JSON.stringify(reason),
      stacktrace: "",
    };
  } catch {
    return {
      errorType: "UnhandledPromiseRejection",
      errorMessage: "Unknown unhandled promise rejection",
      stacktrace: "",
    };
  }
}

export function setupGlobalErrorCapture() {
  if (cleanupHandler) {
    return cleanupHandler;
  }

  const handleWindowError = (event) => {
    console.log("handleWindowError", event.error)
    void reportIncident({
      title: "JavaScript runtime crash",
      severity: INCIDENT_SEVERITIES.CRITICAL,
      error_type: event.error?.name || "JavaScriptError",
      error_code: "JAVASCRIPT_RUNTIME_ERROR",
      error_message: event.message || "Unknown JavaScript runtime error",
      stacktrace: event.error?.stack || "",
      module: "frontend-runtime",
      component: "Window",
      function_name: "errorEventListener",
      url: window.location.href,
      metadata: {
        source: "window-error",
        source_file: event.filename || "",
        line_number: event.lineno || 0,
        column_number: event.colno || 0,
      },
    });
  };

  const handleUnhandledRejection = (event) => {
    const details = normalizeRejectedReason(event.reason);
    console.log("handleUnhandledRejection", event.reason)

    void reportIncident({
      title: "Unhandled promise rejection",
      severity: INCIDENT_SEVERITIES.ERROR,
      error_type: details.errorType,
      error_code: "UNHANDLED_PROMISE_REJECTION",
      error_message: details.errorMessage,
      stacktrace: details.stacktrace,
      module: "frontend-runtime",
      component: "Window",
      function_name: "unhandledRejectionListener",
      url: window.location.href,
      metadata: {
        source: "unhandled-rejection",
      },
    });
  };

  window.addEventListener("error", handleWindowError);
  window.addEventListener("unhandledrejection", handleUnhandledRejection);

  cleanupHandler = () => {
    window.removeEventListener("error", handleWindowError);
    window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    cleanupHandler = null;
  };

  return cleanupHandler;
}
