export function normalizeRoleName(role) {
  const roleMap = { Admin: "Admin", admin: "Admin", Analyst: "Product Analyst", "Product Lead": "Product Analyst", product_analyst: "Product Analyst", "Product Analyst": "Product Analyst", support_lead: "Support Lead", "Support Lead": "Support Lead" };
  return roleMap[role] || role;
}
export function getRoleChipColor(role) {
  if (role === "Admin") return { backgroundColor: "#ede9fe", color: "#6d28d9", borderColor: "#c4b5fd" };
  if (role === "Product Analyst") return { backgroundColor: "#dcfce7", color: "#15803d", borderColor: "#bbf7d0" };
  if (role === "Support Lead") return { backgroundColor: "#ffedd5", color: "#c2410c", borderColor: "#fed7aa" };
  return { backgroundColor: "#f8fafc", color: "#475569", borderColor: "#cbd5e1" };
}
