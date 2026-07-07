import { Box, Button, Card, CardContent, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { ROLE_OPTIONS } from "./userManagementConstants";
import { getRoleChipColor } from "./userManagementUtils";
import { deleteButtonStyle, panelStyle, panelTitle, roleChipStyle, tableStyle, updateButtonStyle } from "./userManagementStyles";

function UserDirectoryCard({ users, filters, onFilterChange, onUpdate, onDelete }) { // Displays user list with filters
  return (
    <Card sx={panelStyle}>
      <CardContent sx={{ padding: "22px !important" }}>
        <Box sx={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "18px", flexWrap: { xs: "wrap", lg: "nowrap" } }}>
          <Typography sx={{ ...panelTitle, whiteSpace: "nowrap", flexShrink: 0 }}>User Directory</Typography>

          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px", marginLeft: "auto", flexWrap: { xs: "wrap", md: "nowrap" } }}>
            <TextField label="Search" name="search" size="small" value={filters.search} onChange={onFilterChange} sx={{ width: { xs: "100%", md: 190 } }} />

            <TextField select label="Role" name="role" size="small" value={filters.role} onChange={onFilterChange} sx={{ width: { xs: "100%", md: 180 } }}>
              <MenuItem value="">All Roles</MenuItem>
              {ROLE_OPTIONS.map((role) => <MenuItem key={role} value={role}>{role}</MenuItem>)} {/* Renders role filter options */}
            </TextField>

            <TextField select label="Show" name="limit" size="small" value={filters.limit} onChange={onFilterChange} sx={{ width: { xs: "100%", md: 130 } }}>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="3">3 Users</MenuItem>
              <MenuItem value="5">5 Users</MenuItem>
              <MenuItem value="10">10 Users</MenuItem>
            </TextField>
          </Box>
        </Box>

        <Box sx={{ width: "100%", overflowX: "auto" }}> {/* Enables horizontal scroll on smaller screens */}
          <Box component="table" sx={tableStyle}>
            <thead>
              <tr><th>User Name</th><th>Email</th><th>Role</th><th>Action</th></tr>
            </thead>

            <tbody>
              {users.map((user) => <UserRow key={user.id} user={user} onUpdate={onUpdate} onDelete={onDelete} />)}
              {users.length === 0 && <tr><td colSpan="4">No users found</td></tr>} {/* Empty state */}
            </tbody>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function UserRow({ user, onUpdate, onDelete }) { // Displays single user row
  return (
    <tr>
      <td>{user.name}</td>
      <td>{user.email}</td>

      <td>
        <Box component="span" sx={{ ...roleChipStyle, ...getRoleChipColor(user.role) }}>{user.role}</Box> {/* Role chip with dynamic color */}
      </td>

      <td>
        <Stack direction="row" spacing={0.7} justifyContent="center" alignItems="center">
          <Button variant="outlined" size="small" onClick={() => onUpdate(user)} sx={updateButtonStyle}>Edit</Button>
          <Button variant="outlined" size="small" onClick={() => onDelete(user.id)} sx={deleteButtonStyle}>Delete</Button>
        </Stack>
      </td>
    </tr>
  );
}

export default UserDirectoryCard;