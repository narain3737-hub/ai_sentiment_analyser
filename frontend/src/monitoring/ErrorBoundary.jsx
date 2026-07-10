import { Component } from "react";
import { reportIncident } from "./incidentReporter";
import { INCIDENT_SEVERITIES } from "./severity";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.log("incident", error)
    void reportIncident({
      title: "React component tree crashed",
      severity: INCIDENT_SEVERITIES.CRITICAL,
      error_type: error?.name || "ReactRenderError",
      error_code: "REACT_ERROR_BOUNDARY",
      error_message: error?.message || "Unknown render error",
      stacktrace: error?.stack || "",
      module: "frontend-runtime",
      component: "ErrorBoundary",
      function_name: "componentDidCatch",
      url: window.location.href,
      metadata: {
        source: "react-error-boundary",
        component_stack: info?.componentStack || "",
      },
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8fafc",
          fontFamily: "Inter, sans-serif",
          padding: "24px",
        }}>
          <div style={{
            background: "#fff",
            borderRadius: "16px",
            border: "1px solid #fecaca",
            padding: "40px",
            maxWidth: "480px",
            width: "100%",
            textAlign: "center",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
            <h1 style={{ color: "#dc2626", fontSize: "20px", marginBottom: "8px" }}>
              Something went wrong
            </h1>
            <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "24px" }}>
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "10px 24px",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
