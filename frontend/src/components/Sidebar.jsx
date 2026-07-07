import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";

import { getCurrentUser, logoutUser } from "../services/api.jsx";
import { MENU_ITEMS, isRoleAllowed } from "../utils/roleConfig";

function Sidebar() { // Sidebar with role-based menu and logout
  const navigate = useNavigate();
  const location = useLocation();

  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const loadCurrentUser = async () => { // Loads logged-in user details
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch {
        setCurrentUser(null);
        navigate("/login", { replace: true }); // Redirects if user is not authenticated
      } finally {
        setLoadingUser(false);
      }
    };

    loadCurrentUser();
  }, [navigate]);

  const visibleMenuItems = useMemo(() => { // Filters menu items based on user role
    if (!currentUser?.role) {
      return [];
    }

    return MENU_ITEMS.filter((item) =>
      isRoleAllowed(currentUser.role, item.allowedRoles)
    );
  }, [currentUser]);

  const handleLogout = async () => { // Logs out user and redirects to login
    try {
      await logoutUser();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  if (loadingUser) { // Shows loader while fetching user
    return (
      <Box
        sx={{
          width: 170,
          minWidth: 170,
          height: "100vh",
          position: "sticky",
          top: 0,
          backgroundColor: "#eef2f7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: 170,
        minWidth: 170,
        height: "100vh",
        position: "sticky", // Keeps sidebar fixed while scrolling
        top: 0,
        backgroundColor: "#eef2f7",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "16px 8px",
        boxSizing: "border-box",
      }}
    >
      <Box>
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 800,
            marginBottom: "18px",
            color: "#111827",
          }}
        >
          MENU
        </Typography>

        <List disablePadding>
          {visibleMenuItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              location.pathname.startsWith(`${item.path}/`); // Checks active route

            return (
              <ListItemButton
                key={item.path}
                onClick={() => navigate(item.path)} // Navigates to selected page
                sx={{
                  borderRadius: "8px",
                  marginBottom: "8px",
                  padding: "10px 12px",
                  backgroundColor: isActive ? "#dbeafe" : "transparent",
                  color: isActive ? "#1e3a8a" : "#1e293b",
                  "&:hover": {
                    backgroundColor: "#dbeafe",
                  },
                }}
              >
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: 14,
                    fontWeight: isActive ? 700 : 500,
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      <Box>
        <Divider sx={{ marginBottom: "12px" }} />

        <Box sx={{ padding: "8px 6px", marginBottom: "10px" }}>
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 800,
              color: "#0f172a",
              wordBreak: "break-word",
            }}
          >
            {currentUser?.name || "User"} {/* Displays current user name */}
          </Typography>

          <Typography
            sx={{
              fontSize: 12,
              color: "#475569",
              marginTop: "3px",
              wordBreak: "break-word",
            }}
          >
            {currentUser?.roleLabel || currentUser?.role || ""} {/* Displays user role */}
          </Typography>
        </Box>

        <Button
          fullWidth
          variant="outlined"
          color="error"
          onClick={handleLogout}
          sx={{
            height: 38,
            fontWeight: 800,
            textTransform: "none",
            backgroundColor: "#fee2e2",
            borderColor: "#fecaca",
            borderRadius: "10px",
            "&:hover": {
              backgroundColor: "#fecaca",
              borderColor: "#fca5a5",
            },
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
}

export default Sidebar;