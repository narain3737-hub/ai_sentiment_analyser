import { Button, Stack } from "@mui/material";
import { primaryButtonStyle, secondaryButtonStyle } from "./addFeedbackStyles";

// Reusable component for rendering primary and secondary action buttons
function ActionButtons({
  primaryText,
  primaryIcon,
  primaryType = "button", // Default type avoids accidental form submission
  onPrimary,
  secondaryText,
  secondaryIcon,
  onSecondary,
  disabled
}) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }} // Responsive layout: column on mobile, row on larger screens
      spacing={1}
      justifyContent="center"
      alignItems="center"
      sx={{ mt: 2, width: "100%" }}
    >
      <Button
        type={primaryType}
        variant="outlined"
        disabled={disabled}
        startIcon={primaryIcon}
        onClick={onPrimary || undefined} // Calls primary action only when provided
        sx={primaryButtonStyle}
      >
        {primaryText}
      </Button>

      <Button
        type="button" // Keeps secondary button from submitting the form
        variant="outlined"
        onClick={onSecondary}
        startIcon={secondaryIcon}
        sx={secondaryButtonStyle}
      >
        {secondaryText}
      </Button>
    </Stack>
  );
}

export default ActionButtons;