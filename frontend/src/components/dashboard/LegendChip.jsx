import { Box, Stack, Typography } from "@mui/material";

function LegendChip({ label, color }) {
  return (
    <Stack direction="row" spacing={0.8} alignItems="center">
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          backgroundColor: color,
        }}
      />

      <Typography
        sx={{
          color: "#475569",
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        {label}
      </Typography>
    </Stack>
  );
}

export default LegendChip;