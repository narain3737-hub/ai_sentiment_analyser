import { Box, Button, Card, CardContent, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { ROLE_OPTIONS } from "./userManagementConstants";
import { panelStyle, panelTitle, primaryButtonStyle, secondaryButtonStyle } from "./userManagementStyles";

function UserFormCard({ formData, editingUserId, loading, onInputChange, onSubmit, onClear }) { // Displays add/update user form
  return (
    <Card sx={panelStyle}>
      <CardContent sx={{ padding: "22px !important" }}>
        <Typography sx={{ ...panelTitle, marginBottom: "22px" }}>Add / Update User</Typography>

        <Box component="form" onSubmit={onSubmit}> {/* Handles form submit */}
          <Stack spacing={2.2}>
            <TextField label="Full Name" name="name" size="small" value={formData.name} onChange={onInputChange} fullWidth />

            <TextField label="Email" name="email" type="email" size="small" value={formData.email} onChange={onInputChange} fullWidth />

            <TextField label={editingUserId ? "New Password Optional" : "Password"} name="password" type="password" size="small" value={formData.password} onChange={onInputChange} fullWidth />

            <TextField select label="Role" name="role" size="small" value={formData.role} onChange={onInputChange} fullWidth>
              <MenuItem value="">Select Role</MenuItem>
              {ROLE_OPTIONS.map((role) => <MenuItem key={role} value={role}>{role}</MenuItem>)} {/* Renders role options */}
            </TextField>

            <Stack direction="row" spacing={1.5} justifyContent="center" alignItems="center">
              <Button type="submit" variant="contained" disabled={loading} sx={primaryButtonStyle}>
                {editingUserId ? "Update User" : "Add User"} {/* Changes button text based on edit mode */}
              </Button>

              <Button type="button" variant="outlined" onClick={onClear} sx={secondaryButtonStyle}>
                Clear
              </Button>
            </Stack>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}

export default UserFormCard;