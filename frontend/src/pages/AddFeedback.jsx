import { useCallback, useState } from "react";
import { Alert, Box, Stack } from "@mui/material";
import AppLayout from "../components/AppLayout";
import PageHeader from "../components/common/PageHeader";
import ManualFeedbackForm from "../components/add-feedback/ManualFeedbackForm";
import CsvImportPanel from "../components/add-feedback/CsvImportPanel";
import { contentGridStyle, outerPanelStyle } from "../components/add-feedback/addFeedbackStyles";

function AddFeedback() {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [loading, setLoading] = useState(false);
  const showMessage = useCallback((type, text) => { setMessageType(type); setMessage(text); }, []);

  return (
    <AppLayout>
      <Stack spacing={2.4}>
        <PageHeader title="Add Feedback" />
        {message && <Alert severity={messageType}>{message}</Alert>}
        {loading && <Alert severity="info">Processing feedback request...</Alert>}
        <Box sx={outerPanelStyle}>
          <Box sx={contentGridStyle}>
            <ManualFeedbackForm loading={loading} setLoading={setLoading} showMessage={showMessage} />
            <CsvImportPanel loading={loading} setLoading={setLoading} showMessage={showMessage} />
          </Box>
        </Box>
      </Stack>
    </AppLayout>
  );
}

export default AddFeedback;
