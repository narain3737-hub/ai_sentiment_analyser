import { Stack, Typography } from "@mui/material";
import { panelSubTitle, panelTitle } from "./addFeedbackStyles";

function PanelHeader({ title, subtitle }) {
  return (
    <Stack spacing={1}>
      <Typography sx={panelTitle}>{title}</Typography>
      <Typography sx={panelSubTitle}>{subtitle}</Typography>
    </Stack>
  );
}

export default PanelHeader;
