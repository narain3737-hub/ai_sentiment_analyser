import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { analyticsCardStyle, miniLabel } from "./monthlyReportStyles";

export function AnalyticsCard({ title, value, helper, icon, color, bg }) { // Displays one analytics summary card
  return (
    <Card sx={analyticsCardStyle}>
      <CardContent sx={{ padding: "20px !important" }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 54,
              height: 54,
              borderRadius: "17px",
              backgroundColor: bg, // Dynamic icon background color
              color, // Dynamic icon color
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              "& svg": {
                fontSize: 30,
              },
            }}
          >
            {icon}
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography sx={miniLabel}>{title}</Typography>

            <Typography
              sx={{
                fontSize: 30,
                fontWeight: 900,
                color: "#0f172a",
                lineHeight: 1.1,
                mt: 0.5,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap", // Keeps long value in one line
                maxWidth: 160,
              }}
            >
              {value}
            </Typography>

            <Typography
              sx={{
                color: "#64748b",
                fontSize: 12,
                fontWeight: 600,
                mt: 0.4,
              }}
            >
              {helper}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export function EmptyState({ text }) { // Displays message when no data is available
  return (
    <Box
      sx={{
        height: "100%",
        minHeight: 160,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#64748b",
        fontWeight: 600,
        backgroundColor: "#f8fafc",
        borderRadius: "16px",
        border: "1px dashed #cbd5e1",
        textAlign: "center",
        padding: "20px",
      }}
    >
      {text}
    </Box>
  );
}