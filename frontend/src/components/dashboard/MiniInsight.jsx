import { Box, Typography } from "@mui/material";

function MiniInsight({ label, value, color, bg }) {
  return (
    <Box
      sx={{
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        backgroundColor: bg,
        padding: "14px",
      }}
    >
      <Typography
        sx={{
          color: "#64748b",
          fontSize: 12,
          fontWeight: 900,
          textTransform: "uppercase",
          mb: 0.5,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          color,
          fontSize: 20,
          fontWeight: 900,
          lineHeight: 1.2,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

export default MiniInsight;