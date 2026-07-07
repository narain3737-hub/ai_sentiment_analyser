export const panelStyle = {
  borderRadius: "20px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 14px 34px rgba(15, 23, 42, 0.08)",
  backgroundColor: "#ffffff",
};

export const filterGridStyle = {
  width: "100%",
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)", xl: "1.5fr repeat(6, 1fr)" },
  gap: "10px",
  alignItems: "center",
  marginBottom: "18px",
};

export const tableStyle = {
  width: "100%",
  minWidth: "1080px",
  borderCollapse: "collapse",
  tableLayout: "fixed",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  overflow: "hidden",
  "& th": {
    backgroundColor: "#eff6ff",
    padding: "14px 10px",
    textAlign: "center",
    fontSize: 13.5,
    fontWeight: 900,
    color: "#0f172a",
    whiteSpace: "nowrap",
    borderBottom: "1px solid #bfdbfe",
  },
  "& td": {
    height: 82,
    padding: "10px",
    textAlign: "center",
    verticalAlign: "middle",
    borderBottom: "1px solid #e2e8f0",
    color: "#334155",
    fontSize: 13,
    fontWeight: 500,
  },
  "& tbody tr:last-child td": { borderBottom: "none" },
  "& th:nth-of-type(1), & td:nth-of-type(1)": { width: "25%" },
  "& th:nth-of-type(2), & td:nth-of-type(2)": { width: "13%" },
  "& th:nth-of-type(3), & td:nth-of-type(3)": { width: "14%" },
  "& th:nth-of-type(4), & td:nth-of-type(4)": { width: "12%" },
  "& th:nth-of-type(5), & td:nth-of-type(5)": { width: "14%" },
  "& th:nth-of-type(6), & td:nth-of-type(6)": { width: "11%" },
  "& th:nth-of-type(7), & td:nth-of-type(7)": { width: "11%" },
};

export const commonBubbleStyle = {
  width: 100,
  height: 32,
  borderRadius: "10px",
  border: "2px solid",
  fontSize: "12.5px",
  fontWeight: 700,
  textTransform: "none",
  boxShadow: "none",
  "& .MuiChip-label": { width: "100%", textAlign: "center", padding: 0 },
};

export const themeBubbleStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 106,
  height: 32,
  padding: "0 8px",
  borderRadius: "10px",
  border: "2px solid #bfdbfe",
  color: "#1d4ed8",
  backgroundColor: "#eff6ff",
  fontSize: 12.5,
  fontWeight: 800,
};

export const assignedBubbleStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 112,
  height: 32,
  padding: "0 8px",
  borderRadius: "10px",
  border: "2px solid #ddd6fe",
  color: "#6d28d9",
  backgroundColor: "#f5f3ff",
  fontSize: 12,
  fontWeight: 800,
};

export const customerNameStyle = { color: "#0f172a", fontWeight: 900, fontSize: 14, textAlign: "center" };
export const customerMetaWrapperStyle = { display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: "6px", mt: 0.9 };
export const customerMetaChipStyle = { display: "inline-flex", alignItems: "center", justifyContent: "center", height: 24, padding: "0 8px", borderRadius: "8px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", color: "#64748b", fontSize: 11.5, fontWeight: 800, whiteSpace: "nowrap" };
export const customerDateChipStyle = { ...customerMetaChipStyle };

export const viewButtonStyle = {
  minWidth: 74,
  height: 32,
  borderRadius: "10px",
  textTransform: "uppercase",
  fontWeight: 800,
  fontSize: "11.5px",
  letterSpacing: "0.03em",
  backgroundColor: "#ffffff",
  border: "2px solid #90caf9",
  color: "#1976d2",
  boxShadow: "none",
  padding: "0 8px",
  "& .MuiButton-startIcon": { marginRight: "4px", marginLeft: 0 },
  "& .MuiSvgIcon-root": { fontSize: 17 },
  "&:hover": { backgroundColor: "#eff6ff", border: "2px solid #42a5f5", color: "#1565c0", boxShadow: "none" },
};

export const clearButtonStyle = {
  height: 40,
  borderRadius: "12px",
  textTransform: "uppercase",
  fontWeight: 800,
  fontSize: "12px",
  border: "2px solid #cbd5e1",
  color: "#475569",
  whiteSpace: "nowrap",
  boxShadow: "none",
  "&:hover": { backgroundColor: "#f8fafc", border: "2px solid #94a3b8", color: "#334155", boxShadow: "none" },
};

export const assignmentSelectStyle = {
  width: 132,
  height: 32,
  borderRadius: "10px",
  fontWeight: 800,
  fontSize: "11.5px",
  backgroundColor: "#f5f3ff",
  color: "#6d28d9",
  ".MuiOutlinedInput-notchedOutline": { border: "2px solid #ddd6fe", borderRadius: "10px" },
  "&:hover .MuiOutlinedInput-notchedOutline": { border: "2px solid #c4b5fd" },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { border: "2px solid #a78bfa" },
  "& .MuiSelect-select": { height: "32px", minHeight: "32px", padding: "0 28px 0 8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "11.5px", textAlign: "center" },
  "& .MuiSvgIcon-root": { color: "#6d28d9", right: 6, fontSize: 18 },
};

export const statusSelectStyle = (status) => {
  const styles = {
    New: { borderColor: "#93c5fd", color: "#1d4ed8", backgroundColor: "#eff6ff" },
    Planned: { borderColor: "#fdba74", color: "#c2410c", backgroundColor: "#fff7ed" },
    Resolved: { borderColor: "#86efac", color: "#15803d", backgroundColor: "#f0fdf4" },
    Ignored: { borderColor: "#cbd5e1", color: "#475569", backgroundColor: "#f8fafc" },
  };
  const selectedStyle = styles[status] || styles.New;
  return {
    width: 108,
    height: 32,
    borderRadius: "10px",
    fontWeight: 800,
    fontSize: "12px",
    backgroundColor: selectedStyle.backgroundColor,
    color: selectedStyle.color,
    ".MuiOutlinedInput-notchedOutline": { border: `2px solid ${selectedStyle.borderColor}`, borderRadius: "10px" },
    "&:hover .MuiOutlinedInput-notchedOutline": { border: `2px solid ${selectedStyle.borderColor}` },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { border: `2px solid ${selectedStyle.borderColor}` },
    "& .MuiSelect-select": { height: "32px", minHeight: "32px", padding: "0 26px 0 8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "12px", textAlign: "center" },
    "& .MuiSvgIcon-root": { color: selectedStyle.color, right: 6, fontSize: 18 },
  };
};
