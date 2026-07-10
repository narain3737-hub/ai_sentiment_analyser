const SENSITIVE_KEY_PATTERN =
  /authorization|cookie|password|passwd|secret|token|api[-_]?key|access[-_]?key|private[-_]?key|credential/i;

const MAX_DEPTH = 6;
const MAX_ARRAY_ITEMS = 50;
const MAX_STRING_LENGTH = 8000;

function maskString(value) {
  return value
    .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, "Bearer [MASKED]")
    .replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, "[JWT_MASKED]")
    .replace(
      /(api[_-]?key|token|password|secret)=([^&\s]+)/gi,
      "$1=[MASKED]"
    )
    .slice(0, MAX_STRING_LENGTH);
}

export function sanitizeForIncident(value, depth = 0, visited = new WeakSet()) {
  if (depth > MAX_DEPTH) {
    return "[MAX_DEPTH_REACHED]";
  }

  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === "string") {
    return maskString(value);
  }

  if (["number", "boolean"].includes(typeof value)) {
    return value;
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: maskString(value.message || ""),
      stack: maskString(value.stack || ""),
    };
  }

  if (value instanceof FormData) {
    const sanitizedFormData = {};

    value.forEach((entry, key) => {
      if (SENSITIVE_KEY_PATTERN.test(key)) {
        sanitizedFormData[key] = "[MASKED]";
      } else if (entry instanceof File) {
        sanitizedFormData[key] = {
          file_name: entry.name,
          file_size: entry.size,
          file_type: entry.type,
        };
      } else {
        sanitizedFormData[key] = maskString(String(entry));
      }
    });

    return sanitizedFormData;
  }

  if (Array.isArray(value)) {
    return value
      .slice(0, MAX_ARRAY_ITEMS)
      .map((item) => sanitizeForIncident(item, depth + 1, visited));
  }

  if (typeof value === "object") {
    if (visited.has(value)) {
      return "[CIRCULAR_REFERENCE]";
    }

    visited.add(value);
    const sanitizedObject = {};

    Object.entries(value).forEach(([key, entry]) => {
      sanitizedObject[key] = SENSITIVE_KEY_PATTERN.test(key)
        ? "[MASKED]"
        : sanitizeForIncident(entry, depth + 1, visited);
    });

    return sanitizedObject;
  }

  return maskString(String(value));
}
