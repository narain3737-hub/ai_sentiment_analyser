import { Box, Card, CardContent, Typography } from "@mui/material";

export function DashboardStatCard({ card }) {
  return (
    <Card
      sx={{
        borderRadius: "22px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 14px 34px rgba(15, 23, 42, 0.08)",
        backgroundColor: "#ffffff",
        height: "100%",
      }}
    >
      <CardContent
        sx={{
          padding: "20px !important",
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: "18px",
            backgroundColor: card.bg,
            color: card.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            "& svg": {
              fontSize: 32,
            },
          }}
        >
          {card.icon}
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 800,
              color: "#0f172a",
              marginBottom: "6px",
              whiteSpace: "nowrap",
            }}
          >
            {card.title}
          </Typography>

          <Typography
            sx={{
              fontSize: 30,
              fontWeight: 900,
              color: "#0f172a",
              lineHeight: 1,
              marginBottom: "8px",
            }}
          >
            {card.value}
          </Typography>

          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 600,
              color: "#64748b",
            }}
          >
            {card.helper}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

