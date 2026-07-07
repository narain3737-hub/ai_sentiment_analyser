import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Box, Card, CardContent } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import PageHeader from "../components/common/PageHeader";
import FeedbackFilters from "../components/feedback-list/FeedbackFilters";
import FeedbackTable from "../components/feedback-list/FeedbackTable";
import { initialFeedbackFilters } from "../components/feedback-list/feedbackListConstants";
import { panelStyle } from "../components/feedback-list/feedbackListStyles";
import { getApiErrorMessage, getCurrentUser, getFeedbacks, updateFeedbackAssignment, updateFeedbackStatus } from "../services/api.jsx";
import { ROLES } from "../utils/roleConfig";

function FeedbackList() { // Feedback list page component
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [filters, setFilters] = useState(initialFeedbackFilters);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const canAssignFeedback = currentUser?.role === ROLES.ADMIN || currentUser?.role === ROLES.PRODUCT_ANALYST; // Checks assignment permission

  const loadFeedbacks = async () => { // Fetches current user and feedback list
    setLoading(true);
    setMessage("");

    try {
      const [user, result] = await Promise.all([getCurrentUser(), getFeedbacks({ limit: 100 })]); // Runs API calls together
      setCurrentUser(user);
      setFeedbacks(result.items || []);
    } catch (error) {
      setMessage(getApiErrorMessage(error, "Unable to load feedback records."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbacks(); // Loads feedback records on page load
  }, []);

  const filteredFeedbacks = useMemo(() => filterAndSortFeedbacks(feedbacks, filters), [feedbacks, filters]); // Applies filters and sorting

  const handleFilterChange = useCallback((event) => { // Updates filter values
    const { name, value } = event.target;

    setMessage("");

    setFilters((previousValue) => {
      const updatedFilters = { ...previousValue, [name]: value };

      if (name === "fromDate" && updatedFilters.toDate && value && new Date(value) > new Date(updatedFilters.toDate)) {
        setMessage("From Date cannot be greater than To Date.");
        return previousValue; // Prevents invalid date range
      }

      if (name === "toDate" && updatedFilters.fromDate && value && new Date(value) < new Date(updatedFilters.fromDate)) {
        setMessage("To Date cannot be less than From Date.");
        return previousValue; // Prevents invalid date range
      }

      return updatedFilters;
    });
  }, []);

  const handleStatusChange = useCallback(async (feedbackId, newStatus) => { // Updates feedback status
    try {
      const updatedFeedback = await updateFeedbackStatus(feedbackId, newStatus);
      updateFeedbackInState(setFeedbacks, feedbackId, updatedFeedback);
    } catch (error) {
      setMessage(getApiErrorMessage(error, "Unable to update feedback status."));
    }
  }, []);

  const handleAssignmentChange = useCallback(async (feedbackId, assignedTeam) => { // Updates assigned team
    try {
      const updatedFeedback = await updateFeedbackAssignment(feedbackId, assignedTeam);
      updateFeedbackInState(setFeedbacks, feedbackId, updatedFeedback);
    } catch (error) {
      setMessage(getApiErrorMessage(error, "Unable to assign feedback to team."));
    }
  }, []);

  const clearFilters = useCallback(() => { // Resets all filters
    setFilters(initialFeedbackFilters);
    setMessage("");
  }, []);

  return (
    <AppLayout>
      <PageHeader title="Feedback List" />

      <Box sx={{ mt: 2.4 }}>
        {message && <Alert severity="error" sx={{ mb: 2 }}>{message}</Alert>}
        {loading && <Alert severity="info" sx={{ mb: 2 }}>Loading feedback records from backend...</Alert>}

        <Card sx={panelStyle}>
          <CardContent sx={{ padding: "22px !important" }}>
            <FeedbackFilters filters={filters} onFilterChange={handleFilterChange} onClear={clearFilters} />

            <FeedbackTable
              feedbacks={filteredFeedbacks}
              loading={loading}
              canAssignFeedback={canAssignFeedback}
              onAssign={handleAssignmentChange}
              onStatus={handleStatusChange}
              onView={(id) => navigate(`/feedback/${id}`)} // Opens feedback detail page
            />
          </CardContent>
        </Card>
      </Box>
    </AppLayout>
  );
}

function filterAndSortFeedbacks(feedbacks, filters) { // Filters and sorts feedback records
  const filteredItems = feedbacks.filter((feedback) => {
    const searchValue = filters.search.toLowerCase();

    const matchesSearch =
      feedback.customerName?.toLowerCase().includes(searchValue) ||
      feedback.feedbackText?.toLowerCase().includes(searchValue) ||
      feedback.theme?.toLowerCase().includes(searchValue) ||
      feedback.sentiment?.toLowerCase().includes(searchValue) ||
      feedback.channel?.toLowerCase().includes(searchValue) ||
      feedback.feedbackDate?.toLowerCase().includes(searchValue) ||
      feedback.assignedTeam?.toLowerCase().includes(searchValue); // Searches across key feedback fields

    const feedbackDate = feedback.feedbackDateRaw
      ? new Date(feedback.feedbackDateRaw)
      : feedback.createdAtRaw
      ? new Date(feedback.createdAtRaw)
      : null;

    if (filters.fromDate && feedbackDate && feedbackDate < new Date(filters.fromDate)) return false;

    if (filters.toDate && feedbackDate) {
      const toDate = new Date(filters.toDate);
      toDate.setHours(23, 59, 59, 999); // Includes full selected To Date
      if (feedbackDate > toDate) return false;
    }

    const matchesStatus = filters.status ? feedback.status === filters.status : true;
    const matchesSentiment = filters.sentiment ? feedback.sentiment === filters.sentiment : true;
    const matchesTheme = filters.theme ? feedback.theme === filters.theme : true;
    const matchesAssignedTeam = filters.assignedTeam ? feedback.assignedTeam === filters.assignedTeam : true;

    return matchesSearch && matchesStatus && matchesSentiment && matchesTheme && matchesAssignedTeam;
  });

  return [...filteredItems].sort((a, b) => new Date(b.feedbackDateRaw || b.createdAtRaw) - new Date(a.feedbackDateRaw || a.createdAtRaw)); // Sorts newest first
}

function updateFeedbackInState(setFeedbacks, feedbackId, updatedFeedback) { // Updates one feedback item in state
  setFeedbacks((previousFeedbacks) =>
    previousFeedbacks.map((feedback) => (feedback.id === feedbackId ? updatedFeedback : feedback))
  );
}

export default FeedbackList;