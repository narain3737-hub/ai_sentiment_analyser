import { Box, Chip, Typography } from "@mui/material";
import { chipStyle } from "./feedbackDetailStyles";

export function InfoItem({ label, value }) { // Reusable info card for displaying label and value
  return (
    <Box
      sx={{
        borderRadius: "14px",
        border: "1px solid #e2e8f0",
        backgroundColor: "#f8fafc",
        padding: "14px",
      }}
    >
      <Typography
        sx={{
          color: "#64748b",
          fontSize: 12,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          mb: 0.8,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          color: "#0f172a",
          fontSize: 14,
          fontWeight: 800,
          wordBreak: "break-word", // Prevents long text from overflowing
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

export function SentimentChip({ sentiment }) { // Returns styled chip based on sentiment
  const styles = {
    Positive: {
      borderColor: "#86efac",
      color: "#15803d",
      backgroundColor: "#f0fdf4",
    },
    Neutral: {
      borderColor: "#fde68a",
      color: "#b45309",
      backgroundColor: "#fffbeb",
    },
    Negative: {
      borderColor: "#fca5a5",
      color: "#dc2626",
      backgroundColor: "#fef2f2",
    },
  };

  const selectedStyle = styles[sentiment] || styles.Neutral; // Uses Neutral style as fallback

  return (
    <Chip
      label={sentiment || "Neutral"} // Shows Neutral when sentiment is missing
      sx={{
        ...chipStyle,
        ...selectedStyle, // Combines common chip style with sentiment-specific style
      }}
    />
  );
}

export function UrgencyChip({ urgency }) { // Returns styled chip based on urgency level
  const styles = {
    High: {
      borderColor: "#fca5a5",
      color: "#dc2626",
      backgroundColor: "#fef2f2",
    },
    Medium: {
      borderColor: "#fdba74",
      color: "#ea580c",
      backgroundColor: "#fff7ed",
    },
    Low: {
      borderColor: "#86efac",
      color: "#15803d",
      backgroundColor: "#f0fdf4",
    },
  };

  const selectedStyle = styles[urgency] || styles.Low; // Uses Low style as fallback

  return (
    <Chip
      label={urgency || "Low"} // Shows Low when urgency is missing
      sx={{
        ...chipStyle,
        ...selectedStyle, // Combines common chip style with urgency-specific style
      }}
    />
  );
}