import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";
import { ASSIGNMENT_OPTIONS, SENTIMENTS, STATUSES, THEMES } from "./feedbackListConstants";
import { clearButtonStyle, filterGridStyle } from "./feedbackListStyles";

function FeedbackFilters({ filters, onFilterChange, onClear }) { // Renders all feedback filter controls
  return (
    <Box sx={filterGridStyle}>
      <TextField
        label="Search"
        name="search"
        value={filters.search}
        onChange={onFilterChange}
        size="small"
        fullWidth
        InputProps={{ startAdornment: <SearchOutlinedIcon sx={{ color: "#64748b", marginRight: "8px", fontSize: 20 }} /> }} // Adds search icon inside input
      />

      <TextField
        label="From Date"
        name="fromDate"
        type="date"
        size="small"
        value={filters.fromDate}
        onChange={onFilterChange}
        fullWidth
        inputProps={{ max: filters.toDate || undefined }} // Prevents selecting date after To Date
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <TextField
        label="To Date"
        name="toDate"
        type="date"
        size="small"
        value={filters.toDate}
        onChange={onFilterChange}
        fullWidth
        inputProps={{ min: filters.fromDate || undefined }} // Prevents selecting date before From Date
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <FilterSelect label="Status" name="status" value={filters.status} options={STATUSES} allLabel="All Status" onChange={onFilterChange} />
      <FilterSelect label="Sentiment" name="sentiment" value={filters.sentiment} options={SENTIMENTS} allLabel="All Sentiment" onChange={onFilterChange} />
      <FilterSelect label="Theme" name="theme" value={filters.theme} options={THEMES} allLabel="All Themes" onChange={onFilterChange} />
      <FilterSelect label="Assigned" name="assignedTeam" value={filters.assignedTeam} options={ASSIGNMENT_OPTIONS} allLabel="All Teams" onChange={onFilterChange} />

      <Button variant="outlined" startIcon={<RestartAltOutlinedIcon />} onClick={onClear} sx={{ ...clearButtonStyle, width: "100%" }}>
        Clear
      </Button>
    </Box>
  );
}

function FilterSelect({ label, name, value, options, allLabel, onChange }) { // Reusable dropdown filter component
  return (
    <FormControl size="small" fullWidth>
      <InputLabel>{label}</InputLabel>

      <Select label={label} name={name} value={value} onChange={onChange}>
        <MenuItem value="">{allLabel}</MenuItem>
        {options.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)} {/* Renders dropdown options */}
      </Select>
    </FormControl>
  );
}

export default FeedbackFilters;