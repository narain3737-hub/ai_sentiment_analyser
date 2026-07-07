import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AddFeedback = lazy(() => import("./pages/AddFeedback"));
const FeedbackList = lazy(() => import("./pages/FeedbackList"));
const FeedbackDetail = lazy(() => import("./pages/FeedbackDetail"));
const UserManagement = lazy(() => import("./pages/UserManagement"));
const MonthlyReport = lazy(() => import("./pages/MonthlyReport"));

import ProtectedRoute from "./components/ProtectedRoute";
import { ROLES } from "./utils/roleConfig";

function App() { // Defines all application routes
  return (
    <Suspense fallback={null}> {/* Lazy-loaded pages show nothing during chunk load */}
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} /> {/* Redirects root path to dashboard */}

        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute
              allowedRoles={[
                ROLES.ADMIN,
                ROLES.PRODUCT_ANALYST,
                ROLES.SUPPORT_LEAD,
              ]}
            >
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-feedback"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.PRODUCT_ANALYST]}> {/* Only Admin and Product Analyst can add feedback */}
              <AddFeedback />
            </ProtectedRoute>
          }
        />

        <Route
          path="/feedback-list"
          element={
            <ProtectedRoute
              allowedRoles={[
                ROLES.ADMIN,
                ROLES.PRODUCT_ANALYST,
                ROLES.SUPPORT_LEAD,
              ]}
            >
              <FeedbackList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/feedback/:id"
          element={
            <ProtectedRoute
              allowedRoles={[
                ROLES.ADMIN,
                ROLES.PRODUCT_ANALYST,
                ROLES.SUPPORT_LEAD,
              ]}
            >
              <FeedbackDetail /> {/* Dynamic route for single feedback detail */}
            </ProtectedRoute>
          }
        />

        <Route
          path="/monthly-report"
          element={
            <ProtectedRoute
              allowedRoles={[
                ROLES.ADMIN,
                ROLES.PRODUCT_ANALYST,
                ROLES.SUPPORT_LEAD,
              ]}
            >
              <MonthlyReport />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}> {/* Only Admin can access user management */}
              <UserManagement />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} /> {/* Redirects unknown routes */}
      </Routes>
    </Suspense>
  );
}

export default App;