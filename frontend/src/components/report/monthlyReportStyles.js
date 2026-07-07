export const headerButtonStyle = {
  height: 40,
  borderRadius: "12px",
  textTransform: "uppercase",
  fontWeight: 700,
  fontSize: "13px",
  letterSpacing: "0.04em",
  backgroundColor: "#ffffff",
  border: "2px solid #bfdbfe",
  color: "#2563eb",
  boxShadow: "none",
  "&:hover": {
    backgroundColor: "#eff6ff",
    border: "2px solid #93c5fd",
    color: "#1d4ed8",
    boxShadow: "none",
  },
};

export const filterPanelStyle = {
  borderRadius: "20px",
  border: "1px solid #bfdbfe",
  backgroundColor: "#ffffff",
  boxShadow: "0 12px 28px rgba(15, 23, 42, 0.06)",
};

export const analyticsCardStyle = {
  borderRadius: "22px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 14px 34px rgba(15, 23, 42, 0.08)",
  backgroundColor: "#ffffff",
  height: "100%", // Makes cards equal height in grid layout
};

export const mainPanelStyle = {
  borderRadius: "22px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 16px 38px rgba(15, 23, 42, 0.08)",
  backgroundColor: "#ffffff",
};

export const panelTitle = {
  color: "#0f172a",
  fontSize: 20,
  fontWeight: 900,
};

export const panelSubTitle = {
  color: "#64748b",
  fontSize: 13.5,
  fontWeight: 500,
  lineHeight: 1.6,
  mt: 0.5,
};

export const sectionLabel = {
  color: "#0f172a",
  fontSize: 14,
  fontWeight: 900,
  mb: 0.8,
};

export const bodyText = {
  color: "#475569",
  fontSize: 14,
  lineHeight: 1.75, // Improves paragraph readability
  fontWeight: 500,
};

export const highlightBoxStyle = {
  borderRadius: "18px",
  padding: "18px",
  background: "linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)", // Soft highlighted section background
  border: "1px solid #bfdbfe",
};

export const miniPanelStyle = {
  borderRadius: "18px",
  padding: "18px",
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
};

export const miniLabel = {
  color: "#64748b",
  fontSize: 13,
  fontWeight: 700,
};

export const clearButtonStyle = {
  height: 40,
  borderRadius: "12px",
  textTransform: "uppercase",
  fontWeight: 700,
  border: "2px solid #cbd5e1",
  color: "#475569",
  whiteSpace: "nowrap", // Prevents button text from wrapping
};

export const tableHeadStyle = {
  backgroundColor: "#eff6ff",
  color: "#0f172a",
  fontWeight: 900,
  fontSize: 13,
  borderBottom: "1px solid #bfdbfe",
  whiteSpace: "nowrap", // Keeps table headers in one line
};

export const tableCellStyle = {
  color: "#334155",
  fontWeight: 600,
  fontSize: 13.5,
  borderBottom: "1px solid #e2e8f0",
  whiteSpace: "nowrap", // Keeps table cell content in one line
};