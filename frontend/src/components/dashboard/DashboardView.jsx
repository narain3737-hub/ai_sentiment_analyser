import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import AppLayout from "../AppLayout";

import {
  DashboardStatCard,
} from "./DashboardViewParts";

import {
  bubbleStyle,
  clearButtonStyle,
  customerMetaStyle,
  customerNameStyle,
  dateBubbleStyle,
  panelStyle,
  panelSubtitle,
  panelTitle,
  sentimentColor,
  statusColor,
  tableStyle,
  themeBubbleStyle,
} from "./dashboardViewStyles";
const THEMES = [
  "UI",
  "Performance",
  "Bug",
  "Pricing",
  "Support",
  "Feature Request",
  "Other",
];
const PIE_COLORS = {
  Positive: "#22c55e",
  Neutral: "#f59e0b",
  Negative: "#ef4444",
};
function DashboardView({
  currentUser,
  loading,
  message,
  filters,
  dashboardCards,
  sentimentChartData,
  recentFeedbacks,
  aiSummary,
  recordsCount,
  onFilterChange,
  onClearFilters,
}) {
  return (
    <AppLayout>
      <Box
        sx={{
          borderRadius: "20px",
          border: "1px solid #dbeafe",
          padding: {
            xs: "14px",
            md: "18px",
          },
        }}
      >
        <Box
          sx={{
            padding: {
              xs: "18px 16px",
              md: "22px 24px",
            },
            borderRadius: "18px",
            background:
              "linear-gradient(135deg, #eff6ff 0%, #f8fafc 55%, #faf5ff 100%)",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: {
              xs: "flex-start",
              md: "center",
            },
            justifyContent: "space-between",
            flexDirection: {
              xs: "column",
              md: "row",
            },
            gap: 1.5,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: {
                  xs: 28,
                  md: 34,
                },
                fontWeight: 900,
                color: "#0f172a",
                letterSpacing: "-0.04em",
                lineHeight: 1.1,
              }}
            >
              Dashboard
            </Typography>
            <Typography
              sx={{
                mt: 0.8,
                color: "#64748b",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Track feedback performance, sentiment movement, theme trends, and
              AI-generated monthly insights.
            </Typography>
          </Box>
          <Chip
            label={currentUser?.roleLabel || currentUser?.role || "User"}
            sx={{
              backgroundColor: "#ffffff",
              color: "#2563eb",
              border: "1px solid #bfdbfe",
              fontWeight: 900,
              borderRadius: "12px",
              px: 0.5,
            }}
          />
        </Box>
      </Box>
      <Box sx={{ mt: 2.4 }}>
        {message && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}
        {loading && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Loading dashboard data from backend...
          </Alert>
        )}
        <Card sx={panelStyle}>
          <CardContent sx={{ padding: "20px !important" }}>
            <Box
              sx={{
                width: "100%",
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(4, 1fr)",
                },
                gap: "12px",
                alignItems: "center",
              }}
            >
              <FormControl size="small" fullWidth>
                <InputLabel>Theme</InputLabel>
                <Select
                  label="Theme"
                  name="theme"
                  value={filters.theme}
                  onChange={onFilterChange}
                >
                  <MenuItem value="">All Themes</MenuItem>
                  {THEMES.map((theme) => (
                    <MenuItem key={theme} value={theme}>
                      {theme}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="From Date"
                name="fromDate"
                type="date"
                size="small"
                value={filters.fromDate}
                onChange={onFilterChange}
                fullWidth
                inputProps={{
                  max: filters.toDate || undefined,
                }}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />
              <TextField
                label="To Date"
                name="toDate"
                type="date"
                size="small"
                value={filters.toDate}
                onChange={onFilterChange}
                fullWidth
                inputProps={{
                  min: filters.fromDate || undefined,
                }}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />
              <Button
                variant="outlined"
                startIcon={<RestartAltOutlinedIcon />}
                onClick={onClearFilters}
                sx={clearButtonStyle}
              >
                Clear
              </Button>
            </Box>
          </CardContent>
        </Card>
        <Box
          sx={{
            mt: 2.4,
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              lg: "repeat(4, 1fr)",
            },
            gap: "16px",
          }}
        >
          {dashboardCards.map((card) => (
            <DashboardStatCard key={card.title} card={card} />
          ))}
        </Box>
        <Box
          sx={{
            mt: 2.4,
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "1.05fr 1fr",
            },
            gap: "18px",
            alignItems: "stretch",
          }}
        >
          <Card sx={panelStyle}>
            <CardContent sx={{ padding: "22px !important", height: "100%" }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 2,
                  mb: 2,
                }}
              >
                <Box>
                  <Typography sx={panelTitle}>AI Insight</Typography>
                  <Typography sx={panelSubtitle}>
                    Summary based on selected feedback records.
                  </Typography>
                </Box>
                <Chip
                  label={`${recordsCount} records`}
                  sx={{
                    backgroundColor: "#eff6ff",
                    color: "#2563eb",
                    border: "1px solid #bfdbfe",
                    fontWeight: 900,
                    borderRadius: "12px",
                  }}
                />
              </Box>
              <Box
                sx={{
                  minHeight: 230,
                  borderRadius: "18px",
                  background:
                    "linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)",
                  border: "1px solid #e2e8f0",
                  p: 2.4,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Typography
                  sx={{
                    color: "#334155",
                    fontSize: 15,
                    fontWeight: 600,
                    lineHeight: 1.8,
                  }}
                >
                  {aiSummary}
                </Typography>
              </Box>
            </CardContent>
          </Card>
          <Card sx={panelStyle}>
            <CardContent sx={{ padding: "22px !important", height: "100%" }}>
              <Typography sx={panelTitle}>Sentiment Distribution</Typography>
              <Typography sx={panelSubtitle}>
                Positive, neutral, and negative feedback ratio.
              </Typography>
              <Box
                sx={{
                  height: 260,
                  mt: 1,
                }}
              >
                {sentimentChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sentimentChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={92}
                        innerRadius={54}
                        paddingAngle={4}
                      >
                        {sentimentChartData.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={PIE_COLORS[entry.name] || "#94a3b8"}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box
                    sx={{
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#64748b",
                      fontWeight: 700,
                    }}
                  >
                    No sentiment data available.
                  </Box>
                )}
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                {["Positive", "Neutral", "Negative"].map((sentiment) => (
                  <Chip
                    key={sentiment}
                    label={sentiment}
                    sx={{
                      backgroundColor: `${PIE_COLORS[sentiment]}18`,
                      color: PIE_COLORS[sentiment],
                      border: `1px solid ${PIE_COLORS[sentiment]}55`,
                      fontWeight: 900,
                      borderRadius: "12px",
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Card sx={{ ...panelStyle, mt: 2.4 }}>
          <CardContent sx={{ padding: "22px !important" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: {
                  xs: "flex-start",
                  md: "center",
                },
                justifyContent: "space-between",
                gap: 2,
                mb: 2,
                flexDirection: {
                  xs: "column",
                  md: "row",
                },
              }}
            >
              <Box>
                <Typography sx={panelTitle}>Recent Feedback</Typography>
                <Typography sx={panelSubtitle}>
                  Latest records sorted by feedback date.
                </Typography>
              </Box>
            </Box>
            <Box sx={{ width: "100%", overflowX: "auto" }}>
              <Box component="table" sx={tableStyle}>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Sentiment</th>
                    <th>Theme</th>
                    <th>Status</th>
                    <th>Feedback Date</th>
                    <th>Created Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentFeedbacks.map((feedback) => (
                    <tr key={feedback.id}>
                      <td>
                        <Typography sx={customerNameStyle}>
                          {feedback.customerName}
                        </Typography>
                        <Typography sx={customerMetaStyle}>
                          {feedback.channel} • Rating: {feedback.rating || "-"}
                        </Typography>
                      </td>
                      <td>
                        <Box
                          component="span"
                          sx={{
                            ...bubbleStyle,
                            ...sentimentColor(feedback.sentiment),
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
                            ...statusColor(feedback.status),
                          }}
                        >
                          {feedback.status}
                        </Box>
                      </td>
                      <td>
                        <Box component="span" sx={dateBubbleStyle}>
                          {feedback.feedbackDate || "-"}
                        </Box>
                      </td>
                      <td>
                        <Box component="span" sx={dateBubbleStyle}>
                          {feedback.createdAt || "-"}
                        </Box>
                      </td>
                    </tr>
                  ))}
                  {!loading && recentFeedbacks.length === 0 && (
                    <tr>
                      <td colSpan="6">
                        <Typography
                          sx={{
                            color: "#64748b",
                            fontWeight: 700,
                            py: 3,
                          }}
                        >
                          No recent feedback found.
                        </Typography>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </AppLayout>
  );
}
export default DashboardView;
