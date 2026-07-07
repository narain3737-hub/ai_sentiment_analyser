import { Card, CardContent, Typography } from "@mui/material";

function StatCard({ label, value }) {
  return (
    <Card
      variant="outlined"
      sx={{
        border: "2px solid #cbd5e1",
        borderRadius: "10px",
        backgroundColor: "#f8fafc",
        minHeight: 70,
      }}
    >
      <CardContent sx={{ padding: "10px 12px !important" }}>
        <Typography sx={{ fontSize: 14, color: "#334155" }}>
          {label}
        </Typography>

        <Typography sx={{ fontSize: 25, fontWeight: 800, color: "#1d4ed8" }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default StatCard;