import axios from "axios";
import {
  mapBackendRoleToFrontend,
  mapFrontendRoleToBackend,
} from "../utils/roleConfig.js"; // Role mapping shared with roleConfig — single source of truth

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"; // Uses env API URL or local backend

const api = axios.create({ // Creates reusable Axios instance
  baseURL: API_BASE_URL,
  withCredentials: true, // Sends cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
});


function getResponseData(response) { // Extracts actual API data from response
  return response?.data?.data ?? response?.data;
}

function toNumberOrNull(value) { // Converts empty values to null, otherwise number
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  return Number(value);
}

function createCsvFile(csvText) { // Converts pasted CSV text into a File object
  return new File([csvText], "feedback_import.csv", {
    type: "text/csv",
  });
}

function createFormData(file) { // Creates FormData for file upload
  const formData = new FormData();
  formData.append("file", file);
  return formData;
}

export function getApiErrorMessage(
  error,
  fallbackMessage = "Something went wrong"
) { // Returns readable API error message
  const detail = error.response?.data?.detail;
  const message = error.response?.data?.message;

  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).join(", ");
  }

  if (typeof detail === "string") {
    return detail;
  }

  if (typeof message === "string") {
    return message;
  }

  return fallbackMessage;
}

export function formatDisplayDate(dateValue) { // Formats date into DD-MM-YYYY
  if (!dateValue) {
    return "-";
  }

  if (typeof dateValue === "string") {
    const isoDateOnlyMatch = dateValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (isoDateOnlyMatch) {
      const [, year, month, day] = isoDateOnlyMatch;
      return `${day}-${month}-${year}`;
    }

    const ddMmYyyyMatch = dateValue.match(/^(\d{2})-(\d{2})-(\d{4})$/);

    if (ddMmYyyyMatch) {
      return dateValue;
    }

    const ddMmYyyySlashMatch = dateValue.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

    if (ddMmYyyySlashMatch) {
      const [, day, month, year] = ddMmYyyySlashMatch;
      return `${day}-${month}-${year}`;
    }
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

// mapBackendRoleToFrontend and mapFrontendRoleToBackend are imported from roleConfig.js and re-exported below
export { mapBackendRoleToFrontend, mapFrontendRoleToBackend };

export function convertUrgencyScoreToLabel(score) { // Converts urgency score into label
  if (score >= 4) {
    return "High";
  }

  if (score >= 2) {
    return "Medium";
  }

  return "Low";
}

export function normalizeFeedback(feedback = {}) { // Converts backend feedback into frontend-friendly format
  const aiAnalysis = feedback.ai_analysis || feedback.aiAnalysis || null;

  const feedbackDateRaw =
    feedback.feedback_date || feedback.feedbackDate || null;

  const createdAtRaw = feedback.created_at || feedback.createdAt || null;
  const updatedAtRaw = feedback.updated_at || feedback.updatedAt || null;

  const urgencyScore =
    feedback.urgency_score ||
    feedback.urgencyScore ||
    aiAnalysis?.urgency_score ||
    1;

  return {
    id: feedback.id,

    customerName: feedback.customer_name || feedback.customerName || "",
    channel: feedback.channel || "",
    rating: feedback.rating ?? "",

    feedbackDateRaw,
    feedbackDate: formatDisplayDate(feedbackDateRaw),

    feedbackText: feedback.feedback_text || feedback.feedbackText || "",
    status: feedback.status || "New",

    assignedTeam: feedback.assigned_team || feedback.assignedTeam || "",

    createdAtRaw,
    updatedAtRaw,
    createdAt: formatDisplayDate(createdAtRaw),
    updatedAt: formatDisplayDate(updatedAtRaw),

    sentiment: feedback.sentiment || aiAnalysis?.sentiment || "Neutral",
    theme: feedback.theme || aiAnalysis?.theme || "Other",
    urgency: feedback.urgency || convertUrgencyScoreToLabel(urgencyScore),
    urgencyScore,

    summary:
      feedback.summary ||
      aiAnalysis?.summary ||
      "AI summary is not available yet.",

    recommendedAction:
      feedback.recommended_action ||
      feedback.recommendedAction ||
      aiAnalysis?.recommended_action ||
      "Review this feedback manually.",

    confidenceScore:
      feedback.confidence_score ||
      feedback.confidenceScore ||
      aiAnalysis?.confidence_score ||
      0,
  };
}

export function normalizeUser(user = {}) { // Converts backend user into frontend-friendly format
  return {
    id: user.id,
    name: user.name || "",
    email: user.email || "",
    role: user.role || "",
    isActive: user.is_active ?? user.isActive ?? true,
    createdAt: formatDisplayDate(user.created_at || user.createdAt),
    updatedAt: formatDisplayDate(user.updated_at || user.updatedAt),
  };
}

export function normalizeLoggedInUser(user = {}) { // Normalizes logged-in user role details
  return {
    ...user,
    role: mapBackendRoleToFrontend(user.role),
    roleLabel: user.role,
  };
}

export async function loginUser({ email, password }) { // Sends login request
  const response = await api.post("/auth/login", {
    email,
    password,
  });

  const result = getResponseData(response);

  return normalizeLoggedInUser(result.user);
}

export async function getCurrentUser() { // Gets current authenticated user
  const response = await api.get("/auth/me");
  return normalizeLoggedInUser(getResponseData(response));
}

export async function logoutUser() { // Logs out current user
  await api.post("/auth/logout");
}

export async function createFeedback(payload) { // Creates a new feedback record
  const response = await api.post("/feedback", {
    customer_name: payload.customerName,
    channel: payload.channel,
    rating: toNumberOrNull(payload.rating),
    feedback_date: payload.feedbackDate,
    feedback_text: payload.feedbackText,
  });

  return normalizeFeedback(getResponseData(response));
}

export async function getFeedbacks(params = {}) { // Gets feedback list with optional filters
  const response = await api.get("/feedback", {
    params,
  });

  const data = getResponseData(response) || {};

  return {
    items: (data.items || []).map(normalizeFeedback),
    total: data.total || 0,
    page: data.page || 1,
    limit: data.limit || 100,
  };
}

export async function getFeedbackById(feedbackId) { // Gets single feedback by ID
  const response = await api.get(`/feedback/${feedbackId}`);
  return normalizeFeedback(getResponseData(response));
}

export async function updateFeedbackStatus(feedbackId, status) { // Updates feedback status
  const response = await api.patch(`/feedback/${feedbackId}/status`, {
    status,
  });

  return normalizeFeedback(getResponseData(response));
}

export async function updateFeedbackAssignment(feedbackId, assignedTeam) { // Updates assigned team
  const response = await api.patch(`/feedback/${feedbackId}/assign`, {
    assigned_team: assignedTeam || null,
  });

  return normalizeFeedback(getResponseData(response));
}

export async function reanalyzeFeedback(feedbackId) { // Triggers AI reanalysis
  const response = await api.post(`/ai/feedback/${feedbackId}/reanalyze`);
  return normalizeFeedback(getResponseData(response));
}

export async function deleteFeedback(feedbackId) { // Deletes feedback record
  const response = await api.delete(`/feedback/${feedbackId}`);
  return getResponseData(response);
}

export async function importFeedbackCsv(csvText) { // Imports pasted CSV text
  return importFeedbackCsvFile(createCsvFile(csvText));
}

export async function importFeedbackCsvFile(file) { // Uploads CSV file
  const response = await api.post("/feedback/import", createFormData(file), {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return getResponseData(response);
}

export async function getDashboardSummary() { // Gets dashboard sentiment summary
  const response = await api.get("/dashboard/sentiment");
  return getResponseData(response);
}

export async function getMonthlyReport(params = {}) { // Gets monthly report data
  const response = await api.get("/reports/monthly", {
    params,
  });

  return getResponseData(response);
}

export async function getUsers(params = {}) { // Gets user list
  const response = await api.get("/users", {
    params,
  });

  const data = getResponseData(response) || {};

  return {
    items: (data.items || []).map(normalizeUser),
    total: data.total || 0,
  };
}

export async function createUser(payload) { // Creates new user
  const response = await api.post("/users", {
    name: payload.name,
    email: payload.email,
    password: payload.password,
    role: mapFrontendRoleToBackend(payload.role),
    is_active: true,
  });

  return normalizeUser(getResponseData(response));
}

export async function updateUser(userId, payload) { // Updates existing user
  const requestBody = {
    name: payload.name,
    email: payload.email,
    role: mapFrontendRoleToBackend(payload.role),
    is_active: true,
  };

  if (payload.password?.trim()) {
    requestBody.password = payload.password.trim(); // Sends password only when entered
  }

  const response = await api.put(`/users/${userId}`, requestBody);

  return normalizeUser(getResponseData(response));
}

export async function deleteUser(userId) { // Deletes user
  const response = await api.delete(`/users/${userId}`);
  return getResponseData(response);
}

export default api;