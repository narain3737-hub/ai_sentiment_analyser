export const INCIDENT_SEVERITIES = Object.freeze({
  CRITICAL: "CRITICAL",
  ERROR: "ERROR",
  WARNING: "WARNING",
  INFO: "INFO",
  DEBUG: "DEBUG",
  TRACE: "TRACE",
});

const VALID_SEVERITIES = new Set(Object.values(INCIDENT_SEVERITIES));

export function normalizeSeverity(severity) {
  const normalized = String(severity || "").toUpperCase();
  return VALID_SEVERITIES.has(normalized)
    ? normalized
    : INCIDENT_SEVERITIES.ERROR;
}

export function severityForHttpFailure(statusCode, axiosErrorCode = "") {
  if (!statusCode) {
    const normalizedCode = String(axiosErrorCode).toUpperCase();

    if (
      normalizedCode === "ERR_NETWORK" ||
      normalizedCode === "ECONNREFUSED" ||
      normalizedCode === "ENETUNREACH"
    ) {
      return INCIDENT_SEVERITIES.CRITICAL;
    }

    return INCIDENT_SEVERITIES.ERROR;
  }

  if (statusCode >= 400) {
    return INCIDENT_SEVERITIES.ERROR;
  }

  return INCIDENT_SEVERITIES.WARNING;
}
