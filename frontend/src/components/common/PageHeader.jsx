import { Box, Stack, Typography } from "@mui/material";

function PageHeader({ title, actions = null }) {
  return (
    <Box sx={styles.outer}>
      <Box sx={styles.inner}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Typography sx={styles.title}>{title}</Typography>
          {actions}
        </Stack>
      </Box>
    </Box>
  );
}

const styles = {
  outer: {
    borderRadius: "20px",
    border: "1px solid #dbeafe",
    padding: { xs: "14px", md: "18px" },
  },
  inner: {
    padding: { xs: "18px 16px", md: "22px 24px" },
    borderRadius: "18px",
    background: "linear-gradient(135deg, #eff6ff 0%, #f8fafc 55%, #faf5ff 100%)",
    border: "1px solid #e2e8f0",
  },
  title: {
    fontSize: { xs: 28, md: 34 },
    fontWeight: 900,
    color: "#0f172a",
    letterSpacing: "-0.04em",
    lineHeight: 1.1,
  },
};

export default PageHeader;
