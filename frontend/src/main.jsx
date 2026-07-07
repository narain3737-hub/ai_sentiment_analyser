import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./App.css";

ReactDOM.createRoot(document.getElementById("root")).render( // Mounts React app into root div
  <React.StrictMode> {/* Helps detect potential problems during development */}
    <BrowserRouter> {/* Enables routing for the entire app */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);