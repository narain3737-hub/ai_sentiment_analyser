export const STATUSES = ["New", "Planned", "Resolved", "Ignored"];
export const SENTIMENTS = ["Positive", "Neutral", "Negative"];
export const THEMES = ["UI", "Performance", "Bug", "Pricing", "Support", "Feature Request", "Other"];
export const ASSIGNMENT_OPTIONS = [
  "UI Team",
  "Product Team",
  "Bug Developer",
  "Frontend Team",
  "Backend Team",
  "DevOps Team",
  "Finance Team",
  "Support Team",
  "Other Team",
];
export const initialFeedbackFilters = {
  search: "",
  fromDate: "",
  toDate: "",
  status: "",
  sentiment: "",
  theme: "",
  assignedTeam: "",
};
