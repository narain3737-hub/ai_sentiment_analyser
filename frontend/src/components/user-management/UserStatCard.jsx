import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { statCardStyle } from "./userManagementStyles";

function UserStatCard({ title, value, helper, icon, color, bg }) {
  return (
    <Card sx={statCardStyle}>
      <CardContent sx={{ padding: "18px !important" }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Box>
            <Typography sx={{ color: "#64748b", fontSize: 13, fontWeight: 800 }}>{title}</Typography>
            <Typography sx={{ color: "#0f172a", fontSize: 30, fontWeight: 900, lineHeight: 1.1, mt: 0.7 }}>{value}</Typography>
            <Typography sx={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, mt: 0.8 }}>{helper}</Typography>
          </Box>
          <Box sx={{ width: 46, height: 46, borderRadius: "16px", backgroundColor: bg, color, display: "flex", alignItems: "center", justifyContent: "center", "& svg": { fontSize: 26 } }}>{icon}</Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default UserStatCard;
