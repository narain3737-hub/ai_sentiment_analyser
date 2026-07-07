import { useState } from "react";

import { useNavigate } from "react-router-dom";

import {

  Alert,

  Box,

  Button,

  Card,

  CardContent,

  Stack,

  TextField,

  Typography,

} from "@mui/material";

import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";

import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";

import { getApiErrorMessage, loginUser } from "../services/api.jsx";

function Login() { // Login page component

  const navigate = useNavigate();

  const [formData, setFormData] = useState({

    email: "",

    password: "",

  });

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  const handleChange = (event) => { // Updates login form fields

    const { name, value } = event.target;

    setFormData((previousValue) => ({

      ...previousValue,

      [name]: value,

    }));

  };

  const handleSubmit = async (event) => { // Handles login form submit

    event.preventDefault();

    if (!formData.email.trim() || !formData.password.trim()) {

      setMessage("Please enter email and password."); // Validates empty fields

      return;

    }

    setLoading(true);

    setMessage("");

    try {

      await loginUser({

        email: formData.email.trim(),

        password: formData.password.trim(),

      });

      navigate("/dashboard", { replace: true }); // Redirects after successful login

    } catch (error) {

      setMessage(getApiErrorMessage(error, "Invalid email or password."));

    } finally {

      setLoading(false);

    }

  };

  return (

    <Box

      sx={{

        minHeight: "100vh",

        background:

          "linear-gradient(135deg, #eff6ff 0%, #f8fafc 48%, #faf5ff 100%)",

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        padding: "20px",

      }}

    >

      <Card

        sx={{

          width: "100%",

          maxWidth: 430,

          borderRadius: "24px",

          border: "1px solid #dbeafe",

          boxShadow: "0 24px 60px rgba(15, 23, 42, 0.12)",

          backgroundColor: "#ffffff",

        }}

      >

        <CardContent sx={{ padding: "34px !important" }}>

          <Stack spacing={2.6}>

            <Box

              sx={{

                width: "100%",

                display: "flex",

                alignItems: "center",

                justifyContent: "center",

              }}

            >

              <Box

                sx={{

                  width: 64,

                  height: 64,

                  borderRadius: "20px",

                  backgroundColor: "#eff6ff",

                  border: "1px solid #bfdbfe",

                  color: "#2563eb",

                  display: "flex",

                  alignItems: "center",

                  justifyContent: "center",

                  boxShadow: "0 14px 32px rgba(37, 99, 235, 0.12)",

                }}

              >

                <AutoAwesomeOutlinedIcon sx={{ fontSize: 36 }} />

              </Box>

            </Box>

            <Box sx={{ textAlign: "center", width: "100%" }}>

              <Typography

                sx={{

                  color: "#0f172a",

                  fontSize: 28,

                  fontWeight: 900,

                  letterSpacing: "-0.04em",

                  lineHeight: 1.1,

                }}

              >

                Welcome Back

              </Typography>

              <Typography

                sx={{

                  color: "#64748b",

                  fontSize: 14,

                  fontWeight: 600,

                  mt: 0.8,

                }}

              >

                AI Customer Feedback Sentiment Analyzer

              </Typography>

            </Box>

            {message && (

              <Alert severity="error" sx={{ width: "100%" }}>

                {message}

              </Alert>

            )}

            <Box

              component="form"

              onSubmit={handleSubmit} // Submits login form

              sx={{ width: "100%" }}

            >

              <Stack spacing={2}>

                <TextField

                  label="Email"

                  name="email"

                  type="email"

                  size="small"

                  value={formData.email}

                  onChange={handleChange}

                  fullWidth

                />

                <TextField

                  label="Password"

                  name="password"

                  type="password"

                  size="small"

                  value={formData.password}

                  onChange={handleChange}

                  fullWidth

                />

                <Button

                  type="submit"

                  variant="contained"

                  disabled={loading}

                  startIcon={<LoginOutlinedIcon />}

                  sx={{

                    height: 44,

                    borderRadius: "12px",

                    textTransform: "uppercase",

                    fontWeight: 800,

                    letterSpacing: "0.04em",

                    backgroundColor: "#1976d2",

                    boxShadow: "0 12px 28px rgba(25, 118, 210, 0.24)",

                    "&:hover": {

                      backgroundColor: "#1565c0",

                      boxShadow: "0 12px 28px rgba(25, 118, 210, 0.28)",

                    },

                  }}

                >

                  {loading ? "Logging in..." : "Login"} {/* Shows loading text during login */}

                </Button>

              </Stack>

            </Box>

          </Stack>

        </CardContent>

      </Card>

    </Box>

  );

}

export default Login;