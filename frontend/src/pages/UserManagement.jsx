import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Box, Stack } from "@mui/material";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import AppLayout from "../components/AppLayout";
import PageHeader from "../components/common/PageHeader";
import UserDirectoryCard from "../components/user-management/UserDirectoryCard";
import UserFormCard from "../components/user-management/UserFormCard";
import UserStatCard from "../components/user-management/UserStatCard";
import { defaultUserFilters, emptyUserForm, ROLE_ORDER } from "../components/user-management/userManagementConstants";
import { contentGridStyle, pageShellStyle, statsGridStyle } from "../components/user-management/userManagementStyles";
import { normalizeRoleName } from "../components/user-management/userManagementUtils";
import { createUser, deleteUser, getApiErrorMessage, getUsers, updateUser } from "../services/api.jsx";

function UserManagement() { // Main user management page
  const [users, setUsers] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(emptyUserForm);
  const [filters, setFilters] = useState(defaultUserFilters);

  const showMessage = useCallback((type, text) => { 
    setMessageType(type); 
    setMessage(text); 
  }, []); // Shows success/error message

  const loadUsers = useCallback(async () => { // Fetches users from backend
    await Promise.resolve(); // Defer state changes to avoid synchronous setState inside useEffect warning
    setLoading(true);
    setMessage("");

    try {
      const params = buildUserParams(filters); // Converts filters into API params
      const result = await getUsers(params);
      setUsers(result.items || []);
    } catch (error) {
      showMessage("error", getApiErrorMessage(error, "Unable to load users."));
    } finally {
      setLoading(false);
    }
  }, [filters, showMessage]);

  useEffect(() => {
    loadUsers(); // Reloads users when filters change
  }, [loadUsers]);

  const normalizedUsers = useMemo(() => normalizeAndSortUsers(users), [users]); // Normalizes and sorts users
  const counts = useMemo(() => getUserCounts(normalizedUsers), [normalizedUsers]); // Calculates user statistics

  const handleInputChange = ({ target }) => setFormData((previousValue) => ({ ...previousValue, [target.name]: target.value })); // Updates form field

  const handleFilterChange = ({ target }) => setFilters((previousValue) => ({ ...previousValue, [target.name]: target.value })); // Updates filter field

  const clearForm = () => { setEditingUserId(null); setFormData(emptyUserForm); }; // Clears form and edit mode

  const handleSubmit = async (event) => { // Handles add/update user submit
    event.preventDefault();

    const validationError = validateUserForm(formData, editingUserId);
    if (validationError) return showMessage("error", validationError);

    setLoading(true);
    setMessage("");

    try {
      if (editingUserId) await saveExistingUser(editingUserId, formData, setUsers, showMessage);
      else await saveNewUser(formData, setUsers, showMessage);

      clearForm();
      await loadUsers(); // Refreshes list after save
    } catch (error) {
      showMessage("error", getApiErrorMessage(error, "Unable to save user."));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (user) => { // Loads selected user into form for editing
    setEditingUserId(user.id);
    setFormData({ name: user.name || "", email: user.email || "", password: "", role: normalizeRoleName(user.role) });
  };

  const handleDelete = async (userId) => { // Deletes selected user
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    setLoading(true);
    setMessage("");

    try {
      await deleteUser(userId);
      setUsers((previousUsers) => previousUsers.filter((user) => user.id !== userId));

      if (editingUserId === userId) clearForm();

      showMessage("success", "User deleted successfully.");
      await loadUsers(); // Refreshes list after delete
    } catch (error) {
      showMessage("error", getApiErrorMessage(error, "Unable to delete user."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <Box sx={pageShellStyle}>
        <Stack spacing={2.4}>
          <PageHeader title="User Management" />

          {message && <Alert severity={messageType}>{message}</Alert>}
          {loading && <Alert severity="info">Processing user request...</Alert>}

          <Box sx={statsGridStyle}>
            <UserStatCard title="Total Users" value={counts.total} helper="All registered users" icon={<GroupOutlinedIcon />} color="#2563eb" bg="#dbeafe" />
            <UserStatCard title="Admins" value={counts.admins} helper="System administrators" icon={<AdminPanelSettingsOutlinedIcon />} color="#7c3aed" bg="#ede9fe" />
            <UserStatCard title="Product Analysts" value={counts.analysts} helper="Feedback and report users" icon={<BarChartOutlinedIcon />} color="#16a34a" bg="#dcfce7" />
            <UserStatCard title="Support Leads" value={counts.supportLeads} helper="Support status owners" icon={<SupportAgentOutlinedIcon />} color="#f97316" bg="#ffedd5" />
          </Box>

          <Box sx={contentGridStyle}>
            <UserFormCard formData={formData} editingUserId={editingUserId} loading={loading} onInputChange={handleInputChange} onSubmit={handleSubmit} onClear={clearForm} />
            <UserDirectoryCard users={normalizedUsers} filters={filters} onFilterChange={handleFilterChange} onUpdate={handleUpdate} onDelete={handleDelete} />
          </Box>
        </Stack>
      </Box>
    </AppLayout>
  );
}

function buildUserParams(filters) { // Builds API query params from filters
  const params = {};

  if (filters.search.trim()) params.search = filters.search.trim();
  if (filters.role) params.role = filters.role;
  if (filters.limit !== "all") params.limit = Number(filters.limit);

  return params;
}

function validateUserForm(formData, editingUserId) { // Validates user form before save
  if (!formData.name.trim()) return "Full name is required.";
  if (!formData.email.trim()) return "Email is required.";
  if (!formData.role) return "Please select a role.";
  if (!editingUserId && !formData.password.trim()) return "Password is required for new users.";
  return "";
}

async function saveExistingUser(userId, formData, setUsers, showMessage) { // Updates existing user
  const updatedUser = await updateUser(userId, {
    name: formData.name.trim(),
    email: formData.email.trim(),
    password: formData.password.trim(),
    role: formData.role,
    isActive: true,
  });

  setUsers((previousUsers) => previousUsers.map((user) => (user.id === userId ? updatedUser : user)));
  showMessage("success", "User updated successfully.");
}

async function saveNewUser(formData, setUsers, showMessage) { // Creates new user
  const newUser = await createUser({
    name: formData.name.trim(),
    email: formData.email.trim(),
    password: formData.password.trim(),
    role: formData.role,
    isActive: true,
  });

  setUsers((previousUsers) => [newUser, ...previousUsers]);
  showMessage("success", "User created successfully.");
}

function normalizeAndSortUsers(users) { // Normalizes roles and sorts users
  return users
    .map((user) => ({ ...user, role: normalizeRoleName(user.role) }))
    .sort((a, b) => {
      const roleSort = (ROLE_ORDER[a.role] || 99) - (ROLE_ORDER[b.role] || 99);
      return roleSort !== 0 ? roleSort : (a.name || "").localeCompare(b.name || "");
    });
}

function getUserCounts(users) { // Counts users by role
  return {
    total: users.length,
    admins: users.filter((user) => user.role === "Admin").length,
    analysts: users.filter((user) => user.role === "Product Analyst").length,
    supportLeads: users.filter((user) => user.role === "Support Lead").length,
  };
}

export default UserManagement;