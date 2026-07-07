import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, MenuItem, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import TrendingDownOutlinedIcon from "@mui/icons-material/TrendingDownOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import AppLayout from "../../components/AppLayout";
import { AnalyticsCard, EmptyState } from "./MonthlyReportParts";
import { headerButtonStyle, filterPanelStyle, mainPanelStyle, panelTitle, panelSubTitle, sectionLabel, bodyText, highlightBoxStyle, miniPanelStyle, clearButtonStyle, tableHeadStyle, tableCellStyle } from "./monthlyReportStyles";
import { THEMES, THEME_COLORS, getRiskColor } from "./monthlyReportUtils";
function MonthlyReportView({ message, loading, filters, todayValue, analytics, sentimentTrendData, themeRankingData, monthlyComparisonData, executiveSummary, handleFilterChange, clearFilters, exportCsv, exportPdf }) {
  return (
    <AppLayout>
      <Stack spacing={2.4}>
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
            }}
          >
            <Box
              sx={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
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
                Report & Analytics
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  marginLeft: "auto",
                  flexShrink: 0,
                }}
              >
                <Button
                  variant="outlined"
                  startIcon={<DownloadOutlinedIcon />}
                  onClick={exportCsv}
                  sx={headerButtonStyle}
                >
                  CSV
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PictureAsPdfOutlinedIcon />}
                  onClick={exportPdf}
                  sx={headerButtonStyle}
                >
                  PDF
                </Button>
              </Stack>
            </Box>
          </Box>
        </Box>
        {message && <Alert severity="error">{message}</Alert>}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Card sx={filterPanelStyle}>
              <CardContent sx={{ padding: "18px !important" }}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={1.5}
                  alignItems={{ xs: "stretch", md: "center" }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <FilterAltOutlinedIcon sx={{ color: "#2563eb" }} />
                    <Typography sx={panelTitle}>Report Filters</Typography>
                  </Stack>
                  <Box
                    sx={{
                      flex: 1,
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        md: "1fr 1fr 1fr auto",
                      },
                      gap: "12px",
                    }}
                  >
                    <TextField
                      label="From Date"
                      name="fromDate"
                      type="date"
                      size="small"
                      value={filters.fromDate}
                      onChange={handleFilterChange}
                      fullWidth
                      inputProps={{
                        max: filters.toDate || todayValue,
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
                      onChange={handleFilterChange}
                      fullWidth
                      inputProps={{
                        min: filters.fromDate || undefined,
                        max: todayValue,
                      }}
                      slotProps={{
                        inputLabel: {
                          shrink: true,
                        },
                      }}
                    />
                    <TextField
                      select
                      label="Theme"
                      name="theme"
                      size="small"
                      value={filters.theme}
                      onChange={handleFilterChange}
                      fullWidth
                    >
                      <MenuItem value="">All Themes</MenuItem>
                      {THEMES.map((theme) => (
                        <MenuItem key={theme} value={theme}>
                          {theme}
                        </MenuItem>
                      ))}
                    </TextField>
                    <Button
                      variant="outlined"
                      startIcon={<RestartAltOutlinedIcon />}
                      onClick={clearFilters}
                      sx={clearButtonStyle}
                    >
                      Clear
                    </Button>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  lg: "repeat(4, 1fr)",
                },
                gap: "16px",
              }}
            >
              <AnalyticsCard
                title="Total Feedback"
                value={analytics.total}
                helper="Selected report data"
                icon={<AssessmentOutlinedIcon />}
                color="#2563eb"
                bg="#dbeafe"
              />
              <AnalyticsCard
                title="Positive %"
                value={`${analytics.positivePercentage}%`}
                helper={`${analytics.positive} positive records`}
                icon={<TaskAltOutlinedIcon />}
                color="#16a34a"
                bg="#dcfce7"
              />
              <AnalyticsCard
                title="Neutral %"
                value={`${analytics.neutralPercentage}%`}
                helper={`${analytics.neutral} neutral records`}
                icon={<CategoryOutlinedIcon />}
                color="#d97706"
                bg="#fef3c7"
              />
              <AnalyticsCard
                title="Negative %"
                value={`${analytics.negativePercentage}%`}
                helper={`${analytics.negative} negative records`}
                icon={<TrendingDownOutlinedIcon />}
                color="#dc2626"
                bg="#fee2e2"
              />
            </Box>
            <Card sx={mainPanelStyle}>
              <CardContent sx={{ padding: "22px !important" }}>
                <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                  <AutoAwesomeOutlinedIcon sx={{ color: "#2563eb" }} />
                  <Typography sx={panelTitle}>AI Executive Summary</Typography>
                </Stack>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      md: "1.5fr 0.5fr",
                    },
                    gap: "16px",
                    alignItems: "stretch",
                  }}
                >
                  <Box sx={highlightBoxStyle}>
                    <Typography sx={sectionLabel}>Business Summary</Typography>
                    <Typography sx={bodyText}>{executiveSummary}</Typography>
                  </Box>
                  <Box sx={miniPanelStyle}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <WarningAmberOutlinedIcon
                        sx={{
                          color: getRiskColor(analytics.riskLevel),
                          fontSize: 22,
                        }}
                      />
                      <Typography sx={sectionLabel}>Risk Level</Typography>
                    </Stack>
                    <Typography
                      sx={{
                        fontSize: 32,
                        fontWeight: 900,
                        color: getRiskColor(analytics.riskLevel),
                        mt: 1,
                      }}
                    >
                      {analytics.riskLevel}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  lg: "1fr 1fr",
                },
                gap: "18px",
              }}
            >
              <Card sx={mainPanelStyle}>
                <CardContent sx={{ padding: "22px !important" }}>
                  <Typography sx={panelTitle}>Sentiment Trend</Typography>
                  <Typography sx={panelSubTitle}>
                    Positive, neutral, and negative movement based on selected
                    feedback date range.
                  </Typography>
                  <Box sx={{ height: 300, mt: 2 }}>
                    {sentimentTrendData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sentimentTrendData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                          />
                          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="Positive"
                            stroke="#22c55e"
                            strokeWidth={3}
                          />
                          <Line
                            type="monotone"
                            dataKey="Neutral"
                            stroke="#f59e0b"
                            strokeWidth={3}
                          />
                          <Line
                            type="monotone"
                            dataKey="Negative"
                            stroke="#ef4444"
                            strokeWidth={3}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <EmptyState text="No sentiment trend data available for the selected date range." />
                    )}
                  </Box>
                </CardContent>
              </Card>
              <Card sx={mainPanelStyle}>
                <CardContent sx={{ padding: "22px !important" }}>
                  <Typography sx={panelTitle}>Theme Ranking</Typography>
                  <Typography sx={panelSubTitle}>
                    Most repeated themes based on selected feedback date range.
                  </Typography>
                  <Box sx={{ height: 300, mt: 2 }}>
                    {themeRankingData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={themeRankingData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="theme"
                            tick={{ fontSize: 11 }}
                            interval={0}
                          />
                          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                          <Tooltip />
                          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                            {themeRankingData.map((entry) => (
                              <Cell
                                key={entry.theme}
                                fill={THEME_COLORS[entry.theme] || "#64748b"}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <EmptyState text="No theme ranking data available for the selected date range." />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Box>
            <Card sx={mainPanelStyle}>
              <CardContent sx={{ padding: "22px !important" }}>
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography sx={panelTitle}>
                      Monthly Comparison Table
                    </Typography>
                    <Typography sx={panelSubTitle}>
                      Month-wise feedback count, sentiment percentage, top
                      theme, and resolution performance based on feedback date.
                    </Typography>
                  </Box>
                  <Chip
                    label={`${monthlyComparisonData.length} Month${
                      monthlyComparisonData.length === 1 ? "" : "s"
                    }`}
                    sx={{
                      backgroundColor: "#eff6ff",
                      color: "#2563eb",
                      border: "1px solid #bfdbfe",
                      fontWeight: 800,
                      borderRadius: "12px",
                      flexShrink: 0,
                      ml: "auto",
                    }}
                  />
                </Box>
                <Box sx={{ width: "100%", overflowX: "auto" }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={tableHeadStyle}>Month</TableCell>
                        <TableCell sx={tableHeadStyle}>Total</TableCell>
                        <TableCell sx={tableHeadStyle}>Positive %</TableCell>
                        <TableCell sx={tableHeadStyle}>Neutral %</TableCell>
                        <TableCell sx={tableHeadStyle}>Negative %</TableCell>
                        <TableCell sx={tableHeadStyle}>Top Theme</TableCell>
                        <TableCell sx={tableHeadStyle}>Resolved</TableCell>
                        <TableCell sx={tableHeadStyle}>Resolution %</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {monthlyComparisonData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} align="center">
                            No report data available.
                          </TableCell>
                        </TableRow>
                      ) : (
                        monthlyComparisonData.map((item) => (
                          <TableRow key={item.monthKey}>
                            <TableCell sx={tableCellStyle}>
                              {item.month}
                            </TableCell>
                            <TableCell sx={tableCellStyle}>
                              {item.total}
                            </TableCell>
                            <TableCell sx={tableCellStyle}>
                              {item.positivePercentage}%
                            </TableCell>
                            <TableCell sx={tableCellStyle}>
                              {item.neutralPercentage}%
                            </TableCell>
                            <TableCell sx={tableCellStyle}>
                              {item.negativePercentage}%
                            </TableCell>
                            <TableCell sx={tableCellStyle}>
                              {item.topTheme}
                            </TableCell>
                            <TableCell sx={tableCellStyle}>
                              {item.resolved}
                            </TableCell>
                            <TableCell sx={tableCellStyle}>
                              {item.resolutionRate}%
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </Box>
              </CardContent>
            </Card>
          </>
        )}
      </Stack>
    </AppLayout>
  );
}
export default MonthlyReportView;
