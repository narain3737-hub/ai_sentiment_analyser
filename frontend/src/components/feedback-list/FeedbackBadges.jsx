import { Chip } from "@mui/material";
import { commonBubbleStyle } from "./feedbackListStyles";

export function SentimentChip({ sentiment }) { // Displays sentiment with matching color style
  const styles = {
    Positive: { borderColor: "#86efac", color: "#15803d", backgroundColor: "#f0fdf4" },
    Neutral: { borderColor: "#fde68a", color: "#b45309", backgroundColor: "#fffbeb" },
    Negative: { borderColor: "#fca5a5", color: "#dc2626", backgroundColor: "#fef2f2" },
  };

  return <Chip label={sentiment} sx={{ ...commonBubbleStyle, ...(styles[sentiment] || styles.Neutral) }} />; // Uses Neutral as fallback
}

export function UrgencyChip({ urgency }) { // Displays urgency with matching color style
  const styles = {
    High: { borderColor: "#fca5a5", color: "#dc2626", backgroundColor: "#fef2f2" },
    Medium: { borderColor: "#fdba74", color: "#ea580c", backgroundColor: "#fff7ed" },
    Low: { borderColor: "#86efac", color: "#15803d", backgroundColor: "#f0fdf4" },
  };

  return <Chip label={urgency} sx={{ ...commonBubbleStyle, ...(styles[urgency] || styles.Low) }} />; // Uses Low as fallback
}