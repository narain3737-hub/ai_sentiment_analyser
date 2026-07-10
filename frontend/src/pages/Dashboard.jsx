import { useCallback, useEffect, useMemo, useState } from "react";

import FeedbackOutlinedIcon from "@mui/icons-material/FeedbackOutlined";
import FiberNewOutlinedIcon from "@mui/icons-material/FiberNewOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";

import {
  getApiErrorMessage,
  getCurrentUser,
  getFeedbacks,
} from "../services/api.jsx";

import DashboardView from "../components/dashboard/DashboardView";

function getTodayDateInputValue() { // Returns today's date in input format
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getFeedbackDateObject(feedback) { // Converts feedback date into Date object — defined outside component to avoid recreation on every render
  if (!feedback.feedbackDateRaw) {
    return null;
  }

  const date = new Date(feedback.feedbackDateRaw);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setHours(0, 0, 0, 0); // Normalises date for comparison

  return date;
}

function Dashboard() { // Main dashboard container component
  const [currentUser, setCurrentUser] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const todayValue = getTodayDateInputValue();

  const [filters, setFilters] = useState({
    theme: "",
    fromDate: "",
    toDate: todayValue,
  });

  const loadDashboardData = async () => { // Fetches user and feedback records
    setLoading(true);
    setMessage("");

    // try {
    const [user, feedbackResult] = await Promise.all([
      getCurrentUser(),
      getFeedbacks({ limit: 100 }),
    ]); // Runs API calls together

    setCurrentUser(user);
    setFeedbacks(feedbackResult.items || []);
    // } catch (error) {
    //   setMessage(getApiErrorMessage(error, "Unable to load dashboard data."));
    // } finally {
    //   setLoading(false);
    // }
  };

  useEffect(() => {
    loadDashboardData(); // Loads dashboard data on page load
  }, []);
  const filteredFeedbacks = useMemo(() => { // Applies theme and date filters
    return feedbacks.filter((feedback) => {
      const feedbackDate = getFeedbackDateObject(feedback);

      if (filters.theme && feedback.theme !== filters.theme) {
        return false;
      }

      if (filters.fromDate) {
        if (!feedbackDate) {
          return false;
        }

        const fromDate = new Date(filters.fromDate);
        fromDate.setHours(0, 0, 0, 0);

        if (feedbackDate < fromDate) {
          return false;
        }
      }

      if (filters.toDate) {
        if (!feedbackDate) {
          return false;
        }

        const toDate = new Date(filters.toDate);
        toDate.setHours(23, 59, 59, 999);

        if (feedbackDate > toDate) {
          return false;
        }
      }

      return true;
    });
  }, [feedbacks, filters]);

  const summary = useMemo(() => { // Calculates dashboard summary counts in a single pass
    const counts = filteredFeedbacks.reduce(
      (acc, feedback) => {
        if (feedback.status === "New") acc.newCount += 1;
        if (feedback.status === "Resolved") acc.resolvedCount += 1;
        if (feedback.status === "Ignored") acc.ignoredCount += 1;
        if (feedback.sentiment === "Positive") acc.positiveCount += 1;
        if (feedback.sentiment === "Neutral") acc.neutralCount += 1;
        if (feedback.sentiment === "Negative") acc.negativeCount += 1;
        return acc;
      },
      { newCount: 0, resolvedCount: 0, ignoredCount: 0, positiveCount: 0, neutralCount: 0, negativeCount: 0 }
    );

    return { total: filteredFeedbacks.length, ...counts };
  }, [filteredFeedbacks]);

  const dashboardCards = useMemo(() => { // Builds dashboard card data
    return [
      {
        title: "Total Feedback",
        value: summary.total,
        helper: "All selected records",
        icon: <FeedbackOutlinedIcon />,
        color: "#2563eb",
        bg: "#dbeafe",
      },
      {
        title: "New",
        value: summary.newCount,
        helper: "Needs review",
        icon: <FiberNewOutlinedIcon />,
        color: "#7c3aed",
        bg: "#ede9fe",
      },
      {
        title: "Resolved",
        value: summary.resolvedCount,
        helper: "Completed feedback",
        icon: <TaskAltOutlinedIcon />,
        color: "#16a34a",
        bg: "#dcfce7",
      },
      {
        title: "Ignored",
        value: summary.ignoredCount,
        helper: "No action required",
        icon: <VisibilityOffOutlinedIcon />,
        color: "#64748b",
        bg: "#f1f5f9",
      },
    ];
  }, [summary]);

  const sentimentChartData = useMemo(() => { // Prepares sentiment pie chart data
    return [
      {
        name: "Positive",
        value: summary.positiveCount,
      },
      {
        name: "Neutral",
        value: summary.neutralCount,
      },
      {
        name: "Negative",
        value: summary.negativeCount,
      },
    ].filter((item) => item.value > 0); // Removes empty chart values
  }, [summary]);

  const recentFeedbacks = useMemo(() => { // Gets latest 5 feedback records
    return [...filteredFeedbacks]
      .sort((a, b) => {
        const firstDate = getFeedbackDateObject(a);
        const secondDate = getFeedbackDateObject(b);

        if (!firstDate && !secondDate) {
          return 0;
        }

        if (!firstDate) {
          return 1;
        }

        if (!secondDate) {
          return -1;
        }

        return secondDate - firstDate; // Sorts newest first
      })
      .slice(0, 5);
  }, [filteredFeedbacks]);

  const aiSummary = useMemo(() => { // Creates dashboard insight text
    if (summary.total === 0) {
      return "No feedback records are available for the selected filters. Add or import feedback to generate AI insights.";
    }

    const positivePercentage = Math.round(
      (summary.positiveCount / summary.total) * 100
    );

    const neutralPercentage = Math.round(
      (summary.neutralCount / summary.total) * 100
    );

    const negativePercentage = Math.round(
      (summary.negativeCount / summary.total) * 100
    );

    if (negativePercentage >= 50) {
      return `A large portion of feedback is negative at ${negativePercentage}%. The team should review urgent issues and prioritize customer pain points.`;
    }

    if (positivePercentage >= 50) {
      return `Overall feedback is healthy with ${positivePercentage}% positive sentiment, ${neutralPercentage}% neutral feedback, and ${negativePercentage}% negative feedback. Continue monitoring recurring issues and maintain response quality.`;
    }

    return `Feedback sentiment is mixed with ${positivePercentage}% positive, ${neutralPercentage}% neutral, and ${negativePercentage}% negative feedback. Review neutral and negative records to identify improvement areas.`;
  }, [summary]);

  const handleFilterChange = useCallback((event) => { // Updates dashboard filters
    const { name, value } = event.target;

    setFilters((previousValue) => {
      const updatedFilters = {
        ...previousValue,
        [name]: value,
      };

      const todayDate = new Date(todayValue);
      todayDate.setHours(23, 59, 59, 999);

      if (name === "fromDate" && value) {
        const selectedFromDate = new Date(value);
        selectedFromDate.setHours(0, 0, 0, 0);

        if (selectedFromDate > todayDate) {
          updatedFilters.fromDate = todayValue;
        }

        if (
          updatedFilters.toDate &&
          new Date(updatedFilters.fromDate) > new Date(updatedFilters.toDate)
        ) {
          updatedFilters.toDate = updatedFilters.fromDate;
        }
      }

      if (name === "toDate" && value) {
        const selectedToDate = new Date(value);
        selectedToDate.setHours(23, 59, 59, 999);

        if (selectedToDate > todayDate) {
          updatedFilters.toDate = todayValue;
        }

        if (
          updatedFilters.fromDate &&
          new Date(updatedFilters.toDate) < new Date(updatedFilters.fromDate)
        ) {
          return previousValue; // Prevents invalid date range
        }
      }

      return updatedFilters;
    });
  }, [todayValue]);

  const clearFilters = useCallback(() => { // Resets filters to default values
    setFilters({
      theme: "",
      fromDate: "",
      toDate: todayValue,
    });
  }, [todayValue]);

  return (
    <DashboardView
      currentUser={currentUser}
      loading={loading}
      message={message}
      filters={filters}
      summary={summary}
      dashboardCards={dashboardCards}
      sentimentChartData={sentimentChartData}
      recentFeedbacks={recentFeedbacks}
      aiSummary={aiSummary}
      recordsCount={filteredFeedbacks.length}
      todayValue={todayValue}
      onFilterChange={handleFilterChange}
      onClearFilters={clearFilters}
    />
  );
}

export default Dashboard;