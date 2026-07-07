import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";

import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";

import { useNavigate, useParams } from "react-router-dom";

import AppLayout from "../components/AppLayout";
import {
  getApiErrorMessage,
  getCurrentUser,
  getFeedbackById,
  reanalyzeFeedback,
  updateFeedbackAssignment,
  updateFeedbackStatus,
} from "../services/api.jsx";

import { ROLES } from "../utils/roleConfig";
import {
  panelStyle,
  panelTitle,
  backButtonStyle,
  analysisMetricStyle,
  metricLabel,
  themeBubbleStyle,
  assignedBubbleStyle,
  assignmentSelectStyle,
  statusSelectStyle,
  reanalyzeButtonStyle,
  feedbackBubbleStyle,
  feedbackBubbleLabel,
  feedbackBubbleText,
  aiActionSummaryLayout,
  leftAiColumnStyle,
  aiSubSectionStyle,
  aiTextBoxStyle,
  aiSummaryBoxStyle,
  bodyText
} from "../components/feedback-detail/feedbackDetailStyles";
import { InfoItem, SentimentChip, UrgencyChip } from "../components/feedback-detail/FeedbackDetailParts";

const STATUSES = ["New", "Planned", "Resolved", "Ignored"]; // Feedback status options

const ASSIGNMENT_OPTIONS = [ // Team assignment options
  "UI Team",
  "Product Team",
  "Bug Developer",
  "Frontend Team",
  "Backend Team",
  "DevOps Team",
  "Finance Team",
  "Support Team",
];

function FeedbackDetail() { // Feedback detail page component
  const { id } = useParams(); // Gets feedback ID from URL
  const navigate = useNavigate();

  const [feedback, setFeedback] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const isAdmin =
    currentUser?.role === ROLES.ADMIN ||
    currentUser?.roleLabel === "Admin" ||
    currentUser?.role === "Admin"; // Checks admin access

  const canAssignFeedback =
    currentUser?.role === ROLES.ADMIN ||
    currentUser?.role === ROLES.PRODUCT_ANALYST ||
    currentUser?.roleLabel === "Admin" ||
    currentUser?.roleLabel === "Product Analyst" ||
    currentUser?.role === "Admin" ||
    currentUser?.role === "Product Analyst"; // Checks assignment permission

  useEffect(() => {
    const loadFeedbackDetail = async () => { // Fetches user and feedback details
      setLoading(true);
      setMessage("");

      try {
        const [user, feedbackData] = await Promise.all([
          getCurrentUser(),
          getFeedbackById(id),
        ]); // Runs API calls together

        setCurrentUser(user);
        setFeedback(feedbackData);
      } catch (error) {
        setMessageType("error");
        setMessage(getApiErrorMessage(error, "Unable to load feedback detail."));
      } finally {
        setLoading(false);
      }
    };

    loadFeedbackDetail(); // Loads feedback detail when page opens or ID changes
  }, [id]);

  const handleStatusChange = async (event) => { // Updates feedback status
    const newStatus = event.target.value;

    setActionLoading(true);
    setMessage("");

    try {
      const updatedFeedback = await updateFeedbackStatus(feedback.id, newStatus);
      setFeedback(updatedFeedback);
      setMessageType("success");
      setMessage("Feedback status updated successfully.");
    } catch (error) {
      setMessageType("error");
      setMessage(getApiErrorMessage(error, "Unable to update status."));
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignmentChange = async (event) => { // Updates assigned team
    const assignedTeam = event.target.value;

    setActionLoading(true);
    setMessage("");

    try {
      const updatedFeedback = await updateFeedbackAssignment(
        feedback.id,
        assignedTeam
      );

      setFeedback(updatedFeedback);
      setMessageType("success");
      setMessage("Feedback assigned successfully.");
    } catch (error) {
      setMessageType("error");
      setMessage(getApiErrorMessage(error, "Unable to assign feedback."));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReanalysis = async () => { // Runs AI re-analysis
    setActionLoading(true);
    setMessage("");

    try {
      const updatedFeedback = await reanalyzeFeedback(feedback.id);
      setFeedback(updatedFeedback);
      setMessageType("success");
      setMessage("AI re-analysis completed successfully.");
    } catch (error) {
      setMessageType("error");
      setMessage(getApiErrorMessage(error, "Unable to re-analyze feedback."));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) { // Shows loader while data is loading
    return (
      <AppLayout>
        <Box
          sx={{
            minHeight: "70vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      </AppLayout>
    );
  }

  if (!feedback) { // Shows error if feedback is not found
    return (
      <AppLayout>
        <Alert severity="error">Feedback detail not found.</Alert>
      </AppLayout>
    );
  }

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
              display: "flex",
              alignItems: {
                xs: "flex-start",
                md: "center",
              },
              justifyContent: "space-between",
              gap: 2,
              flexDirection: {
                xs: "column",
                md: "row",
              },
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
                Feedback Detail
              </Typography>

              <Typography
                sx={{
                  mt: 0.8,
                  color: "#64748b",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Review customer information, AI analysis, ownership, and action
                status.
              </Typography>
            </Box>

            <Button
              variant="outlined"
              startIcon={<ArrowBackOutlinedIcon />}
              onClick={() => navigate("/feedback-list")} // Goes back to feedback list
              sx={backButtonStyle}
            >
              Back
            </Button>
          </Box>
        </Box>

        {message && <Alert severity={messageType}>{message}</Alert>}

        {actionLoading && (
          <Alert severity="info">Processing feedback request...</Alert>
        )}

        <Card sx={panelStyle}>
          <CardContent sx={{ padding: "22px !important" }}>
            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
              <AssignmentTurnedInOutlinedIcon sx={{ color: "#2563eb" }} />
              <Typography sx={panelTitle}>Customer Information</Typography>
            </Stack>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                  lg: "repeat(3, 1fr)",
                },
                gap: "14px",
              }}
            >
              <InfoItem label="Customer Name" value={feedback.customerName || "-"} />
              <InfoItem label="Channel" value={feedback.channel || "-"} />
              <InfoItem label="Rating" value={feedback.rating ? `${feedback.rating} / 5` : "-"} />
              <InfoItem label="Feedback Date" value={feedback.feedbackDate || "-"} />
              <InfoItem label="Created Date" value={feedback.createdAt || "-"} />
              <InfoItem label="Assigned Team" value={feedback.assignedTeam || "Unassigned"} />
            </Box>

            <Box sx={feedbackBubbleStyle}>
              <Typography sx={feedbackBubbleLabel}>Feedback</Typography>

              <Typography sx={feedbackBubbleText}>
                {feedback.feedbackText || "-"}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card sx={panelStyle}>
          <CardContent sx={{ padding: "22px !important" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: {
                  xs: "flex-start",
                  sm: "center",
                },
                justifyContent: "space-between",
                gap: 2,
                mb: 2,
                flexDirection: {
                  xs: "column",
                  sm: "row",
                },
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <AutoAwesomeOutlinedIcon sx={{ color: "#7c3aed" }} />
                <Typography sx={panelTitle}>AI Analysis</Typography>
              </Stack>

              {isAdmin && (
                <Button
                  variant="outlined"
                  startIcon={<ReplayOutlinedIcon />}
                  onClick={handleReanalysis}
                  disabled={actionLoading}
                  sx={reanalyzeButtonStyle}
                >
                  Re-AI Analysis
                </Button>
              )}
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                  lg: "repeat(4, 1fr)",
                },
                gap: "14px",
                mb: 2,
              }}
            >
              <Box sx={analysisMetricStyle}>
                <Typography sx={metricLabel}>Sentiment</Typography>
                <SentimentChip sentiment={feedback.sentiment} />
              </Box>

              <Box sx={analysisMetricStyle}>
                <Typography sx={metricLabel}>Theme</Typography>
                <Box component="span" sx={themeBubbleStyle}>
                  {feedback.theme || "Other"}
                </Box>
              </Box>

              <Box sx={analysisMetricStyle}>
                <Typography sx={metricLabel}>Urgency</Typography>
                <UrgencyChip urgency={feedback.urgency} />
              </Box>

              <Box sx={analysisMetricStyle}>
                <Typography sx={metricLabel}>Status</Typography>

                <FormControl size="small" fullWidth>
                  <Select
                    value={feedback.status || "New"}
                    onChange={handleStatusChange}
                    disabled={actionLoading}
                    sx={statusSelectStyle(feedback.status)}
                  >
                    {STATUSES.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Box sx={aiActionSummaryLayout}>
              <Box sx={leftAiColumnStyle}>
                <Box sx={aiSubSectionStyle}>
                  <Typography sx={metricLabel}>Assign Feedback</Typography>

                  {canAssignFeedback ? (
                    <FormControl size="small" fullWidth sx={{ mt: 1 }}>
                      <Select
                        value={feedback.assignedTeam || ""}
                        displayEmpty
                        onChange={handleAssignmentChange}
                        disabled={actionLoading}
                        sx={assignmentSelectStyle}
                      >
                        <MenuItem value="">Unassigned</MenuItem>

                        {ASSIGNMENT_OPTIONS.map((team) => (
                          <MenuItem key={team} value={team}>
                            {team}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <Box component="span" sx={assignedBubbleStyle}>
                      {feedback.assignedTeam || "Unassigned"}
                    </Box>
                  )}
                </Box>

                <Box sx={aiTextBoxStyle}>
                  <Typography sx={metricLabel}>Recommended Action</Typography>

                  <Typography sx={bodyText}>
                    {feedback.recommendedAction ||
                      "Review this feedback manually."}
                  </Typography>
                </Box>
              </Box>

              <Box sx={aiSummaryBoxStyle}>
                <Typography sx={metricLabel}>AI Summary</Typography>

                <Typography sx={bodyText}>
                  {feedback.summary || "AI summary is not available yet."}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </AppLayout>
  );
}

export default FeedbackDetail;