export const THEMES = [
  "UI",
  "Performance",
  "Bug",
  "Pricing",
  "Support",
  "Feature Request",
  "Other",
]; // Theme filter/chart options

export const THEME_COLORS = {
  UI: "#2563eb",
  Performance: "#f97316",
  Bug: "#dc2626",
  Pricing: "#7c3aed",
  Support: "#0891b2",
  "Feature Request": "#16a34a",
  Other: "#64748b",
}; // Color mapping for each feedback theme

export function getTodayDateInputValue() { // Returns today's date in YYYY-MM-DD format
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Converts month to 2 digits
  const day = String(today.getDate()).padStart(2, "0"); // Converts day to 2 digits

  return `${year}-${month}-${day}`;
}

export function getCurrentMonthStartInputValue() { // Returns first day of current month
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}-01`;
}

export function getFeedbackDateObject(feedback) { // Converts feedback date into Date object
  if (!feedback.feedbackDateRaw) return null;

  const date = new Date(feedback.feedbackDateRaw);
  if (Number.isNaN(date.getTime())) return null; // Handles invalid date values

  date.setHours(0, 0, 0, 0); // Normalizes date for comparison
  return date;
}

export function getRiskColor(riskLevel) { // Returns color based on risk level
  if (riskLevel === "High") return "#dc2626";
  if (riskLevel === "Medium") return "#f59e0b";
  if (riskLevel === "Low") return "#16a34a";
  return "#64748b"; // Default fallback color
}