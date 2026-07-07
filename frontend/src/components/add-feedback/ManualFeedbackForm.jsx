import { useState } from "react";
import { Box, Card, CardContent, Divider, MenuItem, Stack, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import { createFeedback, getApiErrorMessage } from "../../services/api.jsx";
import ActionButtons from "./ActionButtons";
import PanelHeader from "./PanelHeader";
import { cardContentStyle, panelStyle, twoColumnGridStyle } from "./addFeedbackStyles";

const CHANNELS = ["App", "Email", "Social Media", "Website", "Other"]; // Channel dropdown options
const RATINGS = [1, 2, 3, 4, 5]; // Rating dropdown options

const initialFormData = { customerName: "", channel: "", rating: "", feedbackDate: "", feedbackText: "" }; // Default form values

function ManualFeedbackForm({ loading, setLoading, showMessage }) {
  const [formData, setFormData] = useState(initialFormData);

  const handleChange = ({ target }) => setFormData((prev) => ({ ...prev, [target.name]: target.value })); // Updates input value by field name

  const clearForm = () => setFormData(initialFormData); // Clears all form fields

  const handleManualSubmit = async (event) => {
    event.preventDefault(); // Prevents page refresh on form submit

    const validationError = validateManualForm(formData); // Checks required fields
    if (validationError) return showMessage("error", validationError);

    setLoading(true); // Disables actions while API request is running

    try {
      await createFeedback({
        customerName: formData.customerName.trim(),
        channel: formData.channel,
        rating: formData.rating,
        feedbackDate: formatDate(formData.feedbackDate), // Converts date to backend format
        feedbackText: formData.feedbackText.trim()
      });

      clearForm();
      showMessage("success", "Feedback created successfully.");
    } catch (error) {
      showMessage("error", getApiErrorMessage(error, "Unable to create feedback."));
    } finally {
      setLoading(false); // Re-enables actions after API request
    }
  };

  return (
    <Card sx={panelStyle}>
      <CardContent sx={cardContentStyle}>
        <PanelHeader title="Manual Feedback" subtitle="Enter a single customer feedback record and save it directly to the database." />
        <Divider sx={{ my: 3 }} />

        <Box component="form" onSubmit={handleManualSubmit}>
          <Stack spacing={2.2}>
            <Box sx={twoColumnGridStyle}>
              <TextField label="Customer Name" name="customerName" size="small" value={formData.customerName} onChange={handleChange} fullWidth />

              <TextField label="Channel" name="channel" size="small" value={formData.channel} onChange={handleChange} select fullWidth>
                <MenuItem value="">Channel</MenuItem>
                {CHANNELS.map((channel) => <MenuItem key={channel} value={channel}>{channel}</MenuItem>)} {/* Displays channel options */}
              </TextField>
            </Box>

            <Box sx={twoColumnGridStyle}>
              <TextField label="Rating" name="rating" size="small" value={formData.rating} onChange={handleChange} select fullWidth>
                <MenuItem value="">No Rating</MenuItem>
                {RATINGS.map((rating) => <MenuItem key={rating} value={rating}>{rating}</MenuItem>)} {/* Displays rating options */}
              </TextField>

              <TextField label="Feedback Date" name="feedbackDate" type="date" size="small" value={formData.feedbackDate} onChange={handleChange} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
            </Box>

            <TextField label="Feedback Text" name="feedbackText" value={formData.feedbackText} onChange={handleChange} multiline minRows={6} maxRows={6} fullWidth />

            <ActionButtons primaryText="Save" primaryIcon={<AddIcon />} primaryType="submit" secondaryText="Clear" secondaryIcon={<ClearIcon />} onSecondary={clearForm} disabled={loading} />
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}

function validateManualForm(formData) {
  if (!formData.customerName.trim()) return "Customer name is required.";
  if (!formData.channel) return "Channel is required.";
  if (!formData.feedbackDate) return "Feedback date is required.";
  if (!formData.feedbackText.trim()) return "Feedback text is required.";
  return "";
}

function formatDate(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return `${day}-${month}-${year}`; // Converts YYYY-MM-DD to DD-MM-YYYY
}

export default ManualFeedbackForm;