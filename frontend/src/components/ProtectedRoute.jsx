import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";

import { getCurrentUser } from "../services/api.jsx";
import { isRoleAllowed } from "../utils/roleConfig";

function ProtectedRoute({ allowedRoles = [], children }) { // Protects routes based on login and role access
  const [checking, setChecking] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const verifyUser = async () => { // Verifies current logged-in user
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch {
        setCurrentUser(null); // Clears user if authentication fails
      } finally {
        setChecking(false); // Stops loading after verification
      }
    };

    verifyUser();
  }, []);

  if (checking) { // Shows loader while checking authentication
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

  if (!currentUser) {
    return <Navigate to="/login" replace />; // Redirects unauthenticated users
  }

  if (
    allowedRoles.length > 0 &&
    !isRoleAllowed(currentUser.role, allowedRoles)
  ) {
    return <Navigate to="/dashboard" replace />; // Redirects users without permission
  }

  return children; // Renders protected page if access is valid
}

export default ProtectedRoute;