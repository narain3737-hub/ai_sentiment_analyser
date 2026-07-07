import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { cardStyle, miniLabel } from "./dashboardStyles";

function DashboardCard({ title, value, helper, icon, color, bg }) {
  return (
    <Card sx={cardStyle}>
      <CardContent sx={{ padding: "20px !important" }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 54,
              height: 54,
              borderRadius: "17px",
              backgroundColor: bg,
              color,
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

          <Box>
            <Typography sx={miniLabel}>{title}</Typography>

            <Typography
              sx={{
                fontSize: 30,
                fontWeight: 900,
                color: "#0f172a",
                lineHeight: 1.1,
                mt: 0.5,
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

export default DashboardCard;