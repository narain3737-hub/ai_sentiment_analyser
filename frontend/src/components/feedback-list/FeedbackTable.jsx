import { Box, Button, FormControl, MenuItem, Select, Typography } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { ASSIGNMENT_OPTIONS, STATUSES } from "./feedbackListConstants";
import { SentimentChip, UrgencyChip } from "./FeedbackBadges";
import {
  assignedBubbleStyle,
  assignmentSelectStyle,
  customerDateChipStyle,
  customerMetaChipStyle,
  customerMetaWrapperStyle,
  customerNameStyle,
  statusSelectStyle,
  tableStyle,
  themeBubbleStyle,
  viewButtonStyle,
} from "./feedbackListStyles";

function FeedbackTable({ feedbacks, loading, canAssignFeedback, onAssign, onStatus, onView }) { // Displays feedback records in table format
  return (
    <Box sx={{ width: "100%", overflowX: "auto" }}> {/* Enables horizontal scroll on small screens */}
      <Box component="table" sx={tableStyle}>
        <thead>
          <tr>
            <th>Customer</th><th>Sentiment</th><th>Theme</th><th>Urgency</th><th>Assigned</th><th>Status</th><th>Action</th>
          </tr>
        </thead>

        <tbody>
          {feedbacks.map((feedback) => (
            <tr key={feedback.id}>
              <td><CustomerCell feedback={feedback} /></td>
              <td><SentimentChip sentiment={feedback.sentiment} /></td>
              <td><Box component="span" sx={themeBubbleStyle}>{feedback.theme}</Box></td>
              <td><UrgencyChip urgency={feedback.urgency} /></td>
              <td><AssignmentCell feedback={feedback} canAssignFeedback={canAssignFeedback} onAssign={onAssign} /></td>
              <td><StatusCell feedback={feedback} onStatus={onStatus} /></td>
              <td><Button variant="outlined" startIcon={<VisibilityIcon />} onClick={() => onView(feedback.id)} sx={viewButtonStyle}>View</Button></td>
            </tr>
          ))}

          {!loading && feedbacks.length === 0 && ( // Shows empty state only after loading is finished
            <tr><td colSpan="7"><Typography sx={{ color: "#64748b", fontWeight: 600, py: 3 }}>No feedback records found.</Typography></td></tr>
          )}
        </tbody>
      </Box>
    </Box>
  );
}

function CustomerCell({ feedback }) { // Displays customer name and basic feedback details
  return (
    <>
      <Typography sx={customerNameStyle}>{feedback.customerName}</Typography>

      <Box sx={customerMetaWrapperStyle}>
        <Box component="span" sx={customerMetaChipStyle}>{feedback.channel}</Box>
        <Box component="span" sx={customerMetaChipStyle}>Rating: {feedback.rating || "-"}</Box>
        <Box component="span" sx={customerDateChipStyle}>{feedback.feedbackDate || feedback.createdAt}</Box>
      </Box>
    </>
  );
}

function AssignmentCell({ feedback, canAssignFeedback, onAssign }) { // Shows assignment dropdown only for permitted users
  if (!canAssignFeedback) {
    return <Box component="span" sx={assignedBubbleStyle}>{feedback.assignedTeam || "Unassigned"}</Box>;
  }

  return (
    <FormControl size="small" sx={{ width: 132 }}>
      <Select value={feedback.assignedTeam || ""} displayEmpty onChange={(event) => onAssign(feedback.id, event.target.value)} sx={assignmentSelectStyle}>
        <MenuItem value="">Unassigned</MenuItem>
        {ASSIGNMENT_OPTIONS.map((team) => <MenuItem key={team} value={team}>{team}</MenuItem>)} {/* Renders team assignment options */}
      </Select>
    </FormControl>
  );
}

function StatusCell({ feedback, onStatus }) { // Allows changing feedback status
  return (
    <FormControl size="small" sx={{ width: 108 }}>
      <Select value={feedback.status} onChange={(event) => onStatus(feedback.id, event.target.value)} sx={statusSelectStyle(feedback.status)}>
        {STATUSES.map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)} {/* Renders status options */}
      </Select>
    </FormControl>
  );
}

export default FeedbackTable;