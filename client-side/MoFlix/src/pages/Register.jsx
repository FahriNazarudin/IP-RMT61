import { useState, useEffect } from "react";
import http from "../lib/http";
import { Navigate, useNavigate, Link, useLocation } from "react-router";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import {
  FaEnvelope,
  FaLock,
  FaUser,
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaGithub,
} from "react-icons/fa";
import "../styles/Register.css";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const access_token = localStorage.getItem("access_token");

  if (access_token) {
    return <Navigate to="/" />;
  }

  // Reset form and scroll to top when route changes (fixes stale page when navigating from login)
  useEffect(() => {
    setFormData({
      username: "",
      email: "",
      password: "",
    });
    setShowPassword(false);
    window.scrollTo(0, 0);

    // Re-initialize Google Sign-In button on route change
    setTimeout(() => {
      if (window.google && document.getElementById("googleSignupButton")) {
        google.accounts.id.initialize({
          client_id:
            "286322794195-c13r4m1bso49nhb4kjo6t9oo344jl0ku.apps.googleusercontent.com",
          callback: handleGoogleSignup,
        });
        google.accounts.id.renderButton(
          document.getElementById("googleSignupButton"),
          {
            theme: "outline",
            size: "large",
            type: "standard",
            shape: "rectangular",
            text: "signup_with",
            width: "100%",
          }
        );
      }
    }, 500);
  }, [location.pathname]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await http({
        method: "POST",
        url: "/register",
        data: {
          username: formData.username.trim(),
          email: formData.email,
          password: formData.password,
        },
      });

      // Set default user status as basic
      localStorage.setItem("user_status", "basic");

      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Registration successful!",
        showConfirmButton: false,
        timer: 1500,
      });

      navigate("/login");
    } catch (error) {
      console.log(error.response?.data, "error");
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: error.response?.data?.message || "Something went wrong!",
      });
    } finally {
      setIsLoading(false);
    }
  };

  async function handleGoogleSignup(response) {
    try {
      if (!response || !response.credential) {
        throw new Error("Invalid Google response");
      }

      const backendResponse = await http({
        method: "POST",
        url: "/google-login", // Assuming this endpoint handles both login and signup
        data: {
          googleToken: response.credential,
        },
      });

      localStorage.setItem("access_token", backendResponse.data.access_token);
      localStorage.setItem("userId", backendResponse.data.userId);
      localStorage.setItem(
        "user_status",
        backendResponse.data.status || "basic"
      );

      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Account created successfully!",
        showConfirmButton: false,
        timer: 1500,
      });

      navigate("/");
    } catch (error) {
      console.error("Google signup error:", error);
      Swal.fire({
        icon: "error",
        title: "Google Signup Failed",
        text:
          error.response?.data?.message ||
          "Something went wrong with Google signup",
      });
    }
  }

  // Add this function to prevent default form submission and handle SPA navigation
  const handleLinkClick = (event, to) => {
    event.preventDefault();
    navigate(to);
  };

  return (
    <motion.div
      className="register-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Left Panel - Purple Gradient */}
      <motion.div
        className="left-panel"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <div className="logo-container">
          <motion.div
            className="logo-circle"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            M
          </motion.div>
          <h3 className="logo-text">MoFlix</h3>
        </div>

        <motion.div
          className="welcome-text"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h1>Get Started with Us</h1>
          <p>Complete these easy steps to register your account.</p>
        </motion.div>

        <motion.div
          className="steps-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="step active">
            <div className="step-number">1</div>
            <span>Sign up your account</span>
          </div>

          <div className="step">
            <div className="step-number">2</div>
            <span>Set up your profile</span>
          </div>

          <div className="step">
            <div className="step-number">3</div>
            <span>Start exploring movies</span>
          </div>
        </motion.div>

        <div className="decoration">
          <div className="decoration-circle"></div>
          <div className="decoration-grid"></div>
        </div>
      </motion.div>

      {/* Right Panel - Sign Up Form */}
      <motion.div
        className="right-panel"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <motion.div
          className="signup-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h2>Sign Up Account</h2>
          <p>Enter your personal data to create your account.</p>

          <div className="social-login-buttons">
            <div id="googleSignupButton"></div>
            {/* Remove Github button */}
          </div>

          <div className="separator">
            <span>Or</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                <FaUser className="input-icon" /> Username
              </label>
              <input
                type="text"
                name="username"
                id="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="eg. johndoe"
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <FaEnvelope className="input-icon" /> Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="eg. johndoe@gmail.com"
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <FaLock className="input-icon" /> Password
              </label>
              <div className="password-container">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="form-control"
                  minLength="8"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <p className="form-hint">Must be at least 8 characters.</p>
            </div>

            <motion.button
              type="submit"
              className="submit-button"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <>
                  <span className="spinner small"></span>
                  <span>Processing...</span>
                </>
              ) : (
                "Sign Up"
              )}
            </motion.button>

            <div className="auth-footer">
              <p>
                Already have an account?
                <Link
                  to="/login"
                  className="auth-link"
                  onClick={(e) => handleLinkClick(e, "/login")}
                >
                  Log in
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
