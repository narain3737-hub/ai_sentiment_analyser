import { Box, Typography } from "@mui/material";
import {
  bubbleStyle,
  customerNameStyle,
  smallTextStyle,
  tableStyle,
  themeBubbleStyle,
} from "./dashboardStyles";

function getSentimentBubbleStyle(sentiment) {
  if (sentiment === "Positive") {
    return {
      color: "#15803d",
      backgroundColor: "#f0fdf4",
      borderColor: "#86efac",
    };
  }

  if (sentiment === "Negative") {
    return {
      color: "#dc2626",
      backgroundColor: "#fef2f2",
      borderColor: "#fca5a5",
    };
  }

  return {
    color: "#b45309",
    backgroundColor: "#fffbeb",
    borderColor: "#fde68a",
  };
}

function getStatusBubbleStyle(status) {
  if (status === "Resolved") {
    return {
      color: "#15803d",
      backgroundColor: "#f0fdf4",
      borderColor: "#86efac",
    };
  }

  if (status === "Ignored") {
    return {
      color: "#475569",
      backgroundColor: "#f8fafc",
      borderColor: "#cbd5e1",
    };
  }

  if (status === "Planned") {
    return {
      color: "#c2410c",
      backgroundColor: "#fff7ed",
      borderColor: "#fdba74",
    };
  }

  return {
    color: "#1d4ed8",
    backgroundColor: "#eff6ff",
    borderColor: "#93c5fd",
  };
}

function RecentFeedbackTable({ feedbacks }) {
  return (
    <Box sx={{ width: "100%", overflowX: "auto" }}>
      <Box component="table" sx={tableStyle}>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Sentiment</th>
            <th>Theme</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {feedbacks.map((feedback) => (
            <tr key={feedback.id}>
              <td>
                <Typography sx={customerNameStyle}>
                  {feedback.customerName}
                </Typography>

                <Typography sx={smallTextStyle}>
                  {feedback.channel} • Rating: {feedback.rating || "-"}
                </Typography>
              </td>

              <td>
                <Box
                  component="span"
                  sx={{
                    ...bubbleStyle,
                    ...getSentimentBubbleStyle(feedback.sentiment),
                  }}
                >
                  {feedback.sentiment}
                </Box>
              </td>

              <td>
                <Box component="span" sx={themeBubbleStyle}>
                  {feedback.theme}
                </Box>
              </td>

              <td>
                <Box
                  component="span"
                  sx={{
                    ...bubbleStyle,
                    ...getStatusBubbleStyle(feedback.status),
                  }}
                >
                  {feedback.status}
                </Box>
              </td>

              <td>{feedback.createdAt}</td>
            </tr>
          ))}

          {feedbacks.length === 0 && (
            <tr>
              <td colSpan="5">
                <Typography
                  sx={{
                    color: "#64748b",
                    fontWeight: 700,
                    py: 3,
                  }}
                >
                  No recent feedback records found.
                </Typography>
              </td>
            </tr>
          )}
        </tbody>
      </Box>
    </Box>
  );
}

export default RecentFeedbackTable;