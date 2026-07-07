import { useEffect, useMemo, useState } from "react";
import MonthlyReportView from "../components/report/MonthlyReportView";
import { getApiErrorMessage, getFeedbacks } from "../services/api.jsx";
import { getCurrentMonthStartInputValue, getFeedbackDateObject, getTodayDateInputValue } from "../components/report/monthlyReportUtils";

function MonthlyReport() { // Main monthly report container
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const todayValue = getTodayDateInputValue();
  const currentMonthStartValue = getCurrentMonthStartInputValue();

  const [filters, setFilters] = useState({
    fromDate: currentMonthStartValue,
    toDate: todayValue,
    theme: "",
  });

  const fetchReportAnalytics = async () => { // Fetches feedback records for analytics
    try {
      setLoading(true);
      setMessage("");

      const feedbackData = await getFeedbacks({ limit: 100 });
      setFeedbacks(feedbackData?.items || []);
    } catch (error) {
      setMessage(getApiErrorMessage(error, "Unable to load report analytics."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportAnalytics(); // Loads report data on page load
  }, []);

  const filteredFeedbacks = useMemo(() => { // Applies date and theme filters
    return feedbacks.filter((feedback) => {
      const feedbackDate = getFeedbackDateObject(feedback);

      if (!feedbackDate) {
        return false;
      }

      if (filters.fromDate) {
        const fromDate = new Date(filters.fromDate);
        fromDate.setHours(0, 0, 0, 0);

        if (feedbackDate < fromDate) {
          return false;
        }
      }

      if (filters.toDate) {
        const toDate = new Date(filters.toDate);
        toDate.setHours(23, 59, 59, 999);

        if (feedbackDate > toDate) {
          return false;
        }
      }

      if (filters.theme && feedback.theme !== filters.theme) {
        return false;
      }

      return true;
    });
  }, [feedbacks, filters]);

  const analytics = useMemo(() => { // Calculates report summary metrics
    const total = filteredFeedbacks.length;

    const positive = filteredFeedbacks.filter(
      (feedback) => feedback.sentiment === "Positive"
    ).length;

    const neutral = filteredFeedbacks.filter(
      (feedback) => feedback.sentiment === "Neutral"
    ).length;

    const negative = filteredFeedbacks.filter(
      (feedback) => feedback.sentiment === "Negative"
    ).length;

    const resolved = filteredFeedbacks.filter(
      (feedback) => feedback.status === "Resolved"
    ).length;

    const themeCount = {};

    filteredFeedbacks.forEach((feedback) => {
      const theme = feedback.theme || "Other";
      themeCount[theme] = (themeCount[theme] || 0) + 1;
    });

    const topTheme =
      Object.entries(themeCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "-"; // Finds most common theme

    const positivePercentage =
      total > 0 ? Math.round((positive / total) * 100) : 0;

    const neutralPercentage =
      total > 0 ? Math.round((neutral / total) * 100) : 0;

    const negativePercentage =
      total > 0 ? Math.round((negative / total) * 100) : 0;

    const riskLevel =
      total === 0
        ? "No Data"
        : negativePercentage >= 50
        ? "High"
        : negativePercentage >= 25
        ? "Medium"
        : "Low"; // Calculates risk based on negative percentage

    return {
      total,
      positive,
      neutral,
      negative,
      resolved,
      topTheme,
      positivePercentage,
      neutralPercentage,
      negativePercentage,
      riskLevel,
    };
  }, [filteredFeedbacks]);

  const sentimentTrendData = useMemo(() => { // Builds day-wise sentiment trend data
    const dailyMap = {};

    filteredFeedbacks.forEach((feedback) => {
      const date = getFeedbackDateObject(feedback);

      if (!date) {
        return;
      }

      const dateKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

      const dateLabel = `${String(date.getDate()).padStart(2, "0")}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = {
          date: dateLabel,
          dateKey,
          Positive: 0,
          Neutral: 0,
          Negative: 0,
        };
      }

      dailyMap[dateKey][feedback.sentiment] =
        (dailyMap[dateKey][feedback.sentiment] || 0) + 1;
    });

    return Object.values(dailyMap).sort((a, b) =>
      a.dateKey.localeCompare(b.dateKey)
    ); // Sorts trend data by date
  }, [filteredFeedbacks]);

  const themeRankingData = useMemo(() => { // Builds theme ranking data
    const themeCount = {};

    filteredFeedbacks.forEach((feedback) => {
      const theme = feedback.theme || "Other";
      themeCount[theme] = (themeCount[theme] || 0) + 1;
    });

    return Object.entries(themeCount)
      .map(([theme, count]) => ({
        theme,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7); // Shows top 7 themes
  }, [filteredFeedbacks]);

  const monthlyComparisonData = useMemo(() => { // Builds month-wise comparison data
    const monthlyMap = {};

    filteredFeedbacks.forEach((feedback) => {
      const date = getFeedbackDateObject(feedback);

      if (!date) {
        return;
      }

      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      const monthLabel = date.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });

      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = {
          month: monthLabel,
          monthKey,
          total: 0,
          positive: 0,
          neutral: 0,
          negative: 0,
          resolved: 0,
          themes: {},
        };
      }

      monthlyMap[monthKey].total += 1;

      if (feedback.sentiment === "Positive") {
        monthlyMap[monthKey].positive += 1;
      }

      if (feedback.sentiment === "Neutral") {
        monthlyMap[monthKey].neutral += 1;
      }

      if (feedback.sentiment === "Negative") {
        monthlyMap[monthKey].negative += 1;
      }

      if (feedback.status === "Resolved") {
        monthlyMap[monthKey].resolved += 1;
      }

      const theme = feedback.theme || "Other";
      monthlyMap[monthKey].themes[theme] =
        (monthlyMap[monthKey].themes[theme] || 0) + 1;
    });

    return Object.values(monthlyMap)
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
      .map((item) => {
        const topTheme =
          Object.entries(item.themes).sort((a, b) => b[1] - a[1])[0]?.[0] ||
          "-";

        return {
          ...item,
          topTheme,
          positivePercentage:
            item.total > 0 ? Math.round((item.positive / item.total) * 100) : 0,
          neutralPercentage:
            item.total > 0 ? Math.round((item.neutral / item.total) * 100) : 0,
          negativePercentage:
            item.total > 0 ? Math.round((item.negative / item.total) * 100) : 0,
          resolutionRate:
            item.total > 0 ? Math.round((item.resolved / item.total) * 100) : 0,
        };
      });
  }, [filteredFeedbacks]);

  const executiveSummary = useMemo(() => { // Creates report insight summary
    if (analytics.total === 0) {
      return "No feedback data is available for the selected report period. Add or import feedback records to generate meaningful analytics.";
    }

    if (analytics.riskLevel === "High") {
      return `Customer risk is high because ${analytics.negativePercentage}% of feedback is negative. The most repeated theme is ${analytics.topTheme}. Immediate review and ownership assignment are recommended.`;
    }

    if (analytics.riskLevel === "Medium") {
      return `Customer risk is moderate. Negative feedback is present at ${analytics.negativePercentage}%, with ${analytics.topTheme} appearing as the top theme. The team should prioritize recurring complaints before they increase.`;
    }

    return `Customer sentiment is stable. Positive feedback is ${analytics.positivePercentage}%, neutral feedback is ${analytics.neutralPercentage}%, and negative feedback is ${analytics.negativePercentage}%. Continue monitoring trends and maintain resolution quality.`;
  }, [analytics]);

  const handleFilterChange = (event) => { // Updates report filters
    const { name, value } = event.target;

    setFilters((previousValue) => {
      const updatedFilters = {
        ...previousValue,
        [name]: value,
      };

      const todayDate = new Date(todayValue);
      todayDate.setHours(23, 59, 59, 999);

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

      if (name === "fromDate" && value) {
        const selectedFromDate = new Date(value);
        selectedFromDate.setHours(0, 0, 0, 0);

        if (selectedFromDate > todayDate) {
          updatedFilters.fromDate = todayValue;
        }

        if (
          updatedFilters.toDate &&
          new Date(updatedFilters.toDate) < new Date(updatedFilters.fromDate)
        ) {
          updatedFilters.toDate = "";
        }
      }

      return updatedFilters;
    });
  };

  const clearFilters = () => { // Resets report filters
    setFilters({
      fromDate: currentMonthStartValue,
      toDate: todayValue,
      theme: "",
    });
  };

  const exportCsv = () => { // Exports filtered report data as CSV
    const headers = [
      "Customer Name",
      "Channel",
      "Rating",
      "Sentiment",
      "Theme",
      "Urgency",
      "Status",
      "Feedback Date",
      "Created Date",
      "Feedback",
    ];

    const rows = filteredFeedbacks.map((feedback) => [
      feedback.customerName,
      feedback.channel,
      feedback.rating || "",
      feedback.sentiment,
      feedback.theme,
      feedback.urgency,
      feedback.status,
      feedback.feedbackDate,
      feedback.createdAt,
      feedback.feedbackText,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value || "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", "report_analytics.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPdf = () => { // Opens browser print dialog for PDF export
    window.print();
  };

  return (
    <MonthlyReportView
      message={message}
      loading={loading}
      filters={filters}
      todayValue={todayValue}
      analytics={analytics}
      sentimentTrendData={sentimentTrendData}
      themeRankingData={themeRankingData}
      monthlyComparisonData={monthlyComparisonData}
      executiveSummary={executiveSummary}
      handleFilterChange={handleFilterChange}
      clearFilters={clearFilters}
      exportCsv={exportCsv}
      exportPdf={exportPdf}
    />
  );
}

export default MonthlyReport;