export const panelStyle = {
  borderRadius: "22px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 14px 34px rgba(15, 23, 42, 0.08)",
  backgroundColor: "#ffffff",
};

export const panelTitle = {
  color: "#0f172a",
  fontSize: 20,
  fontWeight: 900,
};

export const backButtonStyle = {
  height: 40,
  borderRadius: "12px",
  textTransform: "uppercase",
  fontWeight: 800,
  fontSize: "12px",
  backgroundColor: "#ffffff",
  border: "2px solid #bfdbfe",
  color: "#2563eb",
  whiteSpace: "nowrap", // Prevents button text from wrapping
  "&:hover": {
    backgroundColor: "#eff6ff",
    border: "2px solid #93c5fd",
  },
};

export const analysisMetricStyle = {
  borderRadius: "14px",
  border: "1px solid #e2e8f0",
  backgroundColor: "#f8fafc",
  padding: "14px",
};

export const metricLabel = {
  color: "#64748b",
  fontSize: 12,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  mb: 1,
};

export const chipStyle = {
  width: 118,
  height: 34,
  borderRadius: "11px",
  border: "2px solid",
  fontSize: "13px",
  fontWeight: 800,
  textTransform: "none",
  boxShadow: "none",
  "& .MuiChip-label": {
    width: "100%",
    textAlign: "center", // Keeps chip text centered
    padding: 0,
  },
};

export const themeBubbleStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 118,
  height: 34,
  padding: "0 10px",
  borderRadius: "11px",
  border: "2px solid #bfdbfe",
  color: "#1d4ed8",
  backgroundColor: "#eff6ff",
  fontSize: 13,
  fontWeight: 800,
};

export const assignedBubbleStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 142,
  height: 36,
  padding: "0 10px",
  borderRadius: "11px",
  border: "2px solid #ddd6fe",
  color: "#6d28d9",
  backgroundColor: "#f5f3ff",
  fontSize: 13,
  fontWeight: 800,
};

export const assignmentSelectStyle = {
  height: 40,
  borderRadius: "12px",
  fontWeight: 800,
  fontSize: "13px",
  backgroundColor: "#f5f3ff",
  color: "#6d28d9",
  ".MuiOutlinedInput-notchedOutline": {
    border: "2px solid #ddd6fe",
    borderRadius: "12px",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    border: "2px solid #c4b5fd",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    border: "2px solid #a78bfa",
  },
  "& .MuiSelect-select": {
    height: "40px",
    minHeight: "40px",
    padding: "0 34px 0 12px",
    display: "flex",
    alignItems: "center",
    fontWeight: 800,
    fontSize: "13px",
  },
  "& .MuiSvgIcon-root": {
    color: "#6d28d9",
    right: 8,
    fontSize: 20,
  },
};

export const statusSelectStyle = (status) => {
  const styles = {
    New: {
      borderColor: "#93c5fd",
      color: "#1d4ed8",
      backgroundColor: "#eff6ff",
    },
    Planned: {
      borderColor: "#fdba74",
      color: "#c2410c",
      backgroundColor: "#fff7ed",
    },
    Resolved: {
      borderColor: "#86efac",
      color: "#15803d",
      backgroundColor: "#f0fdf4",
    },
    Ignored: {
      borderColor: "#cbd5e1",
      color: "#475569",
      backgroundColor: "#f8fafc",
    },
  };

  const selectedStyle = styles[status] || styles.New; // Uses New style as fallback

  return {
    height: 40,
    borderRadius: "12px",
    fontWeight: 800,
    fontSize: "13px",
    backgroundColor: selectedStyle.backgroundColor,
    color: selectedStyle.color,
    ".MuiOutlinedInput-notchedOutline": {
      border: `2px solid ${selectedStyle.borderColor}`, // Dynamic status border
      borderRadius: "12px",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      border: `2px solid ${selectedStyle.borderColor}`,
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      border: `2px solid ${selectedStyle.borderColor}`,
    },
    "& .MuiSelect-select": {
      height: "40px",
      minHeight: "40px",
      padding: "0 34px 0 12px",
      display: "flex",
      alignItems: "center",
      fontWeight: 800,
      fontSize: "13px",
    },
    "& .MuiSvgIcon-root": {
      color: selectedStyle.color,
      right: 8,
      fontSize: 20,
    },
  };
};

export const reanalyzeButtonStyle = {
  height: 40,
  borderRadius: "12px",
  textTransform: "uppercase",
  fontWeight: 800,
  fontSize: "12px",
  backgroundColor: "#ffffff",
  border: "2px solid #ddd6fe",
  color: "#7c3aed",
  ml: "auto", // Pushes button to the right
  "&:hover": {
    backgroundColor: "#f5f3ff",
    border: "2px solid #c4b5fd",
  },
};

export const feedbackBubbleStyle = {
  mt: 2,
  borderRadius: "18px",
  border: "1px solid #bfdbfe",
  background: "linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)",
  padding: "18px",
};

export const feedbackBubbleLabel = {
  color: "#64748b",
  fontSize: 12,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  mb: 1,
};

export const feedbackBubbleText = {
  color: "#0f172a",
  fontSize: 14.5,
  fontWeight: 700,
  lineHeight: 1.75,
  whiteSpace: "pre-wrap", // Preserves line breaks in feedback text
};

export const aiActionSummaryLayout = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    lg: "0.9fr 1.1fr",
  },
  gap: "14px",
  alignItems: "stretch",
};

export const leftAiColumnStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "14px",
};

export const aiSubSectionStyle = {
  borderRadius: "18px",
  border: "1px solid #e2e8f0",
  backgroundColor: "#f8fafc",
  padding: "18px",
};

export const aiTextBoxStyle = {
  borderRadius: "18px",
  background: "linear-gradient(135deg, #faf5ff 0%, #f8fafc 100%)",
  border: "1px solid #ddd6fe",
  padding: "18px",
  minHeight: 150,
};

export const aiSummaryBoxStyle = {
  borderRadius: "18px",
  background: "linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)",
  border: "1px solid #bfdbfe",
  padding: "18px",
  minHeight: 260,
};

export const bodyText = {
  color: "#334155",
  fontSize: 14.5,
  fontWeight: 600,
  lineHeight: 1.8,
  whiteSpace: "pre-wrap", // Keeps AI text formatting readable
};