import { useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  TextField,
  Typography
} from "@mui/material";

import UploadFileIcon from "@mui/icons-material/UploadFile";
import ClearIcon from "@mui/icons-material/Clear";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import ContentPasteOutlinedIcon from "@mui/icons-material/ContentPasteOutlined";

import {
  getApiErrorMessage,
  importFeedbackCsv,
  importFeedbackCsvFile
} from "../../services/api.jsx";

import ActionButtons from "./ActionButtons";
import PanelHeader from "./PanelHeader";

import {
  activeModeButtonStyle,
  cardContentStyle,
  csvDateHintStyle,
  helperTextStyle,
  modeButtonStyle,
  modeGridStyle,
  panelStyle,
  secondaryButtonStyle,
  selectedFileStyle,
  uploadBoxStyle,
  uploadStackStyle,
  uploadSubtitleStyle,
  uploadTitleStyle
} from "./addFeedbackStyles";

// Main CSV import panel for paste-based and file-based CSV import
function CsvImportPanel({ loading, setLoading, showMessage }) {
  const fileInputRef = useRef(null);

  const [csvMode, setCsvMode] = useState("paste");
  const [csvText, setCsvText] = useState("");
  const [selectedCsvFile, setSelectedCsvFile] = useState(null);

  // Clears pasted CSV text, selected file state, and native file input value
  const clearCsvInputs = () => {
    setCsvText("");
    setSelectedCsvFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handles CSV file selection and validates file type
  const handleCsvFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const isCsvFile =
      file.type === "text/csv" ||
      file.name.toLowerCase().endsWith(".csv");

    if (!isCsvFile) {
      setSelectedCsvFile(null);
      showMessage("error", "Please upload a valid CSV file.");
      return;
    }

    setSelectedCsvFile(file);
    showMessage("success", "");
  };

  // Imports CSV data based on selected mode: paste text or upload file
  const handleCsvImport = async () => {
    if (csvMode === "paste" && !csvText.trim()) {
      return showMessage("error", "Please paste CSV text before importing.");
    }

    if (csvMode === "upload" && !selectedCsvFile) {
      return showMessage("error", "Please choose a CSV file before uploading.");
    }

    setLoading(true);

    try {
      const result =
        csvMode === "paste"
          ? await importFeedbackCsv(csvText)
          : await importFeedbackCsvFile(selectedCsvFile);

      clearCsvInputs();

      showMessage(
        "success",
        `${result.success_count} CSV feedback records ${
          csvMode === "paste" ? "imported" : "uploaded"
        } successfully.`
      );
    } catch (error) {
      showMessage(
        "error",
        getApiErrorMessage(
          error,
          csvMode === "paste"
            ? "Unable to import CSV feedback."
            : "Unable to upload CSV file."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={panelStyle}>
      <CardContent sx={cardContentStyle}>
        <PanelHeader
          title="CSV Import"
          subtitle="Paste CSV text or upload a CSV file based on your choice."
        />

        <Divider sx={{ my: 3 }} />

        {/* Mode selector for choosing between paste and upload */}
        <Box sx={modeGridStyle}>
          <Button
            variant="outlined"
            startIcon={<ContentPasteOutlinedIcon />}
            onClick={() => setCsvMode("paste")}
            sx={csvMode === "paste" ? activeModeButtonStyle : modeButtonStyle}
          >
            Paste CSV
          </Button>

          <Button
            variant="outlined"
            startIcon={<InsertDriveFileOutlinedIcon />}
            onClick={() => setCsvMode("upload")}
            sx={csvMode === "upload" ? activeModeButtonStyle : modeButtonStyle}
          >
            Upload File
          </Button>
        </Box>

        {/* Renders paste area or upload area based on selected CSV mode */}
        {csvMode === "paste" ? (
          <CsvPasteArea csvText={csvText} setCsvText={setCsvText} />
        ) : (
          <CsvUploadArea
            fileInputRef={fileInputRef}
            selectedCsvFile={selectedCsvFile}
            loading={loading}
            onFileChange={handleCsvFileChange}
          />
        )}

        <ActionButtons
          primaryText={csvMode === "paste" ? "Import" : "Upload"}
          primaryIcon={<UploadFileIcon />}
          onPrimary={handleCsvImport}
          secondaryText="Clear"
          secondaryIcon={<ClearIcon />}
          onSecondary={clearCsvInputs}
          disabled={loading || (csvMode === "upload" && !selectedCsvFile)}
        />
      </CardContent>
    </Card>
  );
}

// Text area section for pasting CSV content manually
function CsvPasteArea({ csvText, setCsvText }) {
  return (
    <Stack spacing={2.2}>
      <Typography sx={helperTextStyle}>
        Required columns: customer_name, channel, rating, feedback_date,
        feedback_text
      </Typography>

      <TextField
        label="Paste CSV Text"
        value={csvText}
        onChange={(event) => setCsvText(event.target.value)}
        multiline
        minRows={6}
        maxRows={6}
        fullWidth
        placeholder={`customer_name,channel,rating,feedback_date,feedback_text
Arun Kumar,Website,5,02-07-2026,The dashboard is very clean and easy to use
Priya Sharma,App,2,03-07-2026,The app is slow and keeps crashing`}
      />

      <Typography sx={csvDateHintStyle}>
        CSV date format must be DD-MM-YYYY.
      </Typography>
    </Stack>
  );
}

// Upload section for selecting CSV file from the system
function CsvUploadArea({ fileInputRef, selectedCsvFile, loading, onFileChange }) {
  return (
    <Box sx={uploadBoxStyle}>
      <Stack
        spacing={1.4}
        alignItems="center"
        justifyContent="center"
        sx={uploadStackStyle}
      >
        <InsertDriveFileOutlinedIcon sx={{ fontSize: 46, color: "#1976d2" }} />

        <Box>
          <Typography sx={uploadTitleStyle}>Upload CSV File</Typography>
          <Typography sx={uploadSubtitleStyle}>
            Choose a valid .csv file from your system.
          </Typography>
        </Box>

        {/* Hidden file input triggered using the Choose File button */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={onFileChange}
          style={{ display: "none" }}
        />

        <Button
          variant="outlined"
          disabled={loading}
          onClick={() => fileInputRef.current?.click()}
          sx={{ ...secondaryButtonStyle, width: 150, mx: "auto" }}
        >
          Choose File
        </Button>

        {/* Displays selected CSV file name */}
        {selectedCsvFile && (
          <Typography sx={selectedFileStyle}>
            Selected: {selectedCsvFile.name}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}

export default CsvImportPanel;