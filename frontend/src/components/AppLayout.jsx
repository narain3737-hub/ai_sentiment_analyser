import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Button,
  Stack,
  CircularProgress,
} from "@mui/material";

import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import AddCommentOutlinedIcon from "@mui/icons-material/AddCommentOutlined";
import FormatListBulletedOutlinedIcon from "@mui/icons-material/FormatListBulletedOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";

import { useLocation, useNavigate } from "react-router-dom";
import { getCurrentUser, logoutUser } from "../services/api.jsx";
import { MENU_ITEMS, isRoleAllowed } from "../utils/roleConfig";

const drawerWidth = 200; // Sidebar width

const iconMap = { // Maps menu labels to icons
  Dashboard: <DashboardOutlinedIcon />,
  "Add Feedback": <AddCommentOutlinedIcon />,
  "Feedback List": <FormatListBulletedOutlinedIcon />,
  "Report & Analytics": <AssessmentOutlinedIcon />,
  "User Management": <PeopleAltOutlinedIcon />,
};

function AppLayout({ children }) { // Main layout with sidebar and page content
  const location = useLocation();
  const navigate = useNavigate();

  const [authUser, setAuthUser] = useState(null);
  const [checkingUser, setCheckingUser] = useState(true);

  useEffect(() => {
    const loadCurrentUser = async () => { // Checks logged-in user
      try {
        const user = await getCurrentUser();
        setAuthUser(user);
      } catch {
        setAuthUser(null);
        navigate("/login", { replace: true }); // Redirects if not authenticated
      } finally {
        setCheckingUser(false);
      }
    };

    loadCurrentUser();
  }, [navigate]);

  const allowedMenuItems = useMemo(() => { // Filters sidebar items by user role
    if (!authUser?.role) {
      return [];
    }

    return MENU_ITEMS.filter((item) =>
      isRoleAllowed(authUser.role, item.allowedRoles)
    );
  }, [authUser]);

  const handleLogout = async () => { // Logs out user and redirects to login
    try {
      await logoutUser();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const handleNavigate = (path) => {
    navigate(path); // Navigates to selected menu page
  };

  if (checkingUser) { // Shows loader while checking authentication
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8fafc",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
      }}
    >
      <Drawer
        variant="permanent" // Always visible sidebar
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: "1px solid #cbd5e1",
            background:
              "linear-gradient(180deg, #e2e8f0 0%, #dbeafe 48%, #cbd5e1 100%)",
          },
        }}
      >
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ padding: "20px 14px 16px" }}>
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "13px",
                  backgroundColor: "#ffffff",
                  color: "#2563eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  border: "1px solid #bfdbfe",
                  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
                }}
              >
                <AutoAwesomeOutlinedIcon fontSize="small" />
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    color: "#0f172a",
                    fontSize: 15,
                    fontWeight: 800,
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                  }}
                >
                  AI Feedback
                </Typography>

                <Typography
                  sx={{
                    color: "#475569",
                    fontSize: 10.5,
                    fontWeight: 600,
                    mt: 0.3,
                    whiteSpace: "nowrap",
                  }}
                >
                  Sentiment Analyzer
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Divider sx={{ borderColor: "#cbd5e1" }} />

          <List
            sx={{
              padding: "14px 9px",
              flex: 1,
            }}
          >
            {allowedMenuItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                location.pathname.startsWith(`${item.path}/`); // Checks active route

              return (
                <ListItemButton
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  sx={{
                    borderRadius: "12px",
                    marginBottom: "7px",
                    minHeight: 44,
                    padding: "8px 10px",
                    color: isActive ? "#1976d2" : "#334155",
                    backgroundColor: isActive ? "#ffffff" : "transparent",
                    border: isActive
                      ? "1px solid #93c5fd"
                      : "1px solid transparent",
                    boxShadow: isActive
                      ? "0 10px 24px rgba(37, 99, 235, 0.12)"
                      : "none",
                    "&:hover": {
                      backgroundColor: "#f8fafc",
                      border: "1px solid #bfdbfe",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? "#1976d2" : "#475569",
                      minWidth: 31,
                      "& svg": {
                        fontSize: 21,
                      },
                    }}
                  >
                    {iconMap[item.label]}
                  </ListItemIcon>

                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: 12.8,
                      fontWeight: isActive ? 800 : 650,
                    }}
                  />
                </ListItemButton>
              );
            })}
          </List>

          <Box
            sx={{
              padding: "12px",
              borderTop: "1px solid #cbd5e1",
            }}
          >
            <Box
              sx={{
                backgroundColor: "#ffffff",
                border: "1px solid #bfdbfe",
                borderRadius: "15px",
                padding: "11px",
                marginBottom: "11px",
                boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
              }}
            >
              <Typography
                sx={{
                  color: "#0f172a",
                  fontSize: 13,
                  fontWeight: 800,
                  wordBreak: "break-word",
                }}
              >
                {authUser?.name || "User"} {/* Displays logged-in user's name */}
              </Typography>

              <Typography
                sx={{
                  color: "#64748b",
                  fontSize: 11,
                  fontWeight: 500,
                  mt: 0.3,
                  wordBreak: "break-word",
                }}
              >
                {authUser?.email || "-"} {/* Displays logged-in user's email */}
              </Typography>

              <Typography
                sx={{
                  color: "#1976d2",
                  fontSize: 10.5,
                  fontWeight: 800,
                  mt: 0.6,
                  wordBreak: "break-word",
                }}
              >
                {authUser?.roleLabel || ""} {/* Displays user's role */}
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<LogoutOutlinedIcon />}
              onClick={handleLogout}
              sx={{
                height: 39,
                borderRadius: "12px",
                textTransform: "uppercase",
                fontWeight: 600,
                fontSize: "12px",
                letterSpacing: "0.04em",
                backgroundColor: "#ffffff",
                border: "2px solid #fecaca",
                color: "#dc2626",
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "#fef2f2",
                  border: "2px solid #fca5a5",
                  color: "#b91c1c",
                  boxShadow: "none",
                },
              }}
            >
              Logout
            </Button>
          </Box>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1, // Takes remaining width beside sidebar
          minHeight: "100vh",
          padding: {
            xs: "18px",
            md: "26px",
          },
          overflowX: "hidden",
          backgroundColor: "#f8fafc",
        }}
      >
        {children} {/* Renders current page content */}
      </Box>
    </Box>
  );
}

export default AppLayout;