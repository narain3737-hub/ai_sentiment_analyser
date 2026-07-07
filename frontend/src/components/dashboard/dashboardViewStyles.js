export const panelStyle = {
  borderRadius: "20px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 14px 34px rgba(15, 23, 42, 0.08)",
  backgroundColor: "#ffffff",
};

export const panelTitle = {
  fontSize: 20,
  fontWeight: 900,
  color: "#0f172a",
};

export const panelSubtitle = {
  color: "#64748b",
  fontSize: 13,
  fontWeight: 600,
  mt: 0.5,
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
  "&:hover": {
    backgroundColor: "#f8fafc",
    border: "2px solid #94a3b8",
    color: "#334155",
    boxShadow: "none",
  },
};

export const tableStyle = {
  width: "100%",
  minWidth: "920px",
  borderCollapse: "collapse",
  tableLayout: "fixed",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  overflow: "hidden",
  "& th": {
    backgroundColor: "#eff6ff",
    padding: "14px 12px",
    textAlign: "center",
    fontSize: 14,
    fontWeight: 900,
    color: "#0f172a",
    whiteSpace: "nowrap",
    borderBottom: "1px solid #bfdbfe",
  },
  "& td": {
    height: 68,
    padding: "12px",
    textAlign: "center",
    verticalAlign: "middle",
    borderBottom: "1px solid #e2e8f0",
    color: "#334155",
    fontSize: 13.5,
    fontWeight: 500,
  },
  "& tbody tr:last-child td": {
    borderBottom: "none",
  },
  "& th:nth-of-type(1), & td:nth-of-type(1)": {
    width: "25%",
  },
  "& th:nth-of-type(2), & td:nth-of-type(2)": {
    width: "15%",
  },
  "& th:nth-of-type(3), & td:nth-of-type(3)": {
    width: "17%",
  },
  "& th:nth-of-type(4), & td:nth-of-type(4)": {
    width: "15%",
  },
  "& th:nth-of-type(5), & td:nth-of-type(5)": {
    width: "14%",
  },
  "& th:nth-of-type(6), & td:nth-of-type(6)": {
    width: "14%",
  },
};

export const customerNameStyle = {
  color: "#0f172a",
  fontWeight: 900,
  fontSize: 14,
  textAlign: "center",
};

export const customerMetaStyle = {
  color: "#64748b",
  fontWeight: 600,
  fontSize: 12,
  mt: 0.5,
  textAlign: "center",
};

export const bubbleStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 96,
  height: 32,
  padding: "0 9px",
  borderRadius: "10px",
  border: "2px solid",
  fontSize: 12.5,
  fontWeight: 800,
};

export const themeBubbleStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 106,
  height: 32,
  padding: "0 9px",
  borderRadius: "10px",
  border: "2px solid #bfdbfe",
  color: "#1d4ed8",
  backgroundColor: "#eff6ff",
  fontSize: 12.5,
  fontWeight: 800,
};

export const dateBubbleStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 106,
  height: 32,
  padding: "0 9px",
  borderRadius: "10px",
  border: "2px solid #e2e8f0",
  color: "#64748b",
  backgroundColor: "#f8fafc",
  fontSize: 12.5,
  fontWeight: 800,
};

export function sentimentColor(sentiment) {
  if (sentiment === "Positive") {
    return {
      backgroundColor: "#f0fdf4",
      color: "#15803d",
      borderColor: "#86efac",
    };
  }

  if (sentiment === "Negative") {
    return {
      backgroundColor: "#fef2f2",
      color: "#dc2626",
      borderColor: "#fca5a5",
    };
  }

  return {
    backgroundColor: "#fffbeb",
    color: "#b45309",
    borderColor: "#fde68a",
  };
}

export function statusColor(status) {
  if (status === "Resolved") {
    return {
      backgroundColor: "#f0fdf4",
      color: "#15803d",
      borderColor: "#86efac",
    };
  }

  if (status === "Ignored") {
    return {
      backgroundColor: "#f8fafc",
      color: "#475569",
      borderColor: "#cbd5e1",
    };
  }

  if (status === "Planned") {
    return {
      backgroundColor: "#fff7ed",
      color: "#c2410c",
      borderColor: "#fdba74",
    };
  }

  return {
    backgroundColor: "#eff6ff",
    color: "#1d4ed8",
    borderColor: "#93c5fd",
  };
}

