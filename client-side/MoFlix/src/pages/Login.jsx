import { useEffect, useState } from "react";
import http from "../lib/http";
import { Navigate, useNavigate, Link, useLocation } from "react-router";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock, FaGoogle, FaGithub } from "react-icons/fa";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const access_token = localStorage.getItem("access_token");

  if (access_token) {
    return <Navigate to="/" />;
  }

  async function handleCredentialResponse(response) {
    try {
      if (!response || !response.credential) {
        throw new Error("Invalid Google response");
      }

      const backendResponse = await http({
        method: "POST",
        url: "/google-login",
        data: {
          googleToken: response.credential,
        },
      });

      console.log(backendResponse.data, "<<<<<<< backendResponse.data");
      localStorage.setItem("access_token", backendResponse.data.access_token);
      localStorage.setItem("userId", backendResponse.data.userId);
      localStorage.setItem(
        "user_status",
        backendResponse.data.status || "basic"
      );

      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Login successful!",
        showConfirmButton: false,
        timer: 1500,
      });

      navigate("/");
    } catch (error) {
      console.error("Google login error:", error);

      Swal.fire({
        icon: "error",
        title: "Google Login Failed",
        text:
          error.response?.data?.message ||
          "Something went wrong with Google login",
      });
    }
  }

  useEffect(() => {
    // Initialize Google Sign-In after component mounts
    setTimeout(() => {
      if (window.google && document.getElementById("googleButton")) {
        google.accounts.id.initialize({
          client_id:
            "286322794195-c13r4m1bso49nhb4kjo6t9oo344jl0ku.apps.googleusercontent.com",
          callback: handleCredentialResponse,
        });
        google.accounts.id.renderButton(
          document.getElementById("googleButton"),
          {
            theme: "outline",
            size: "large",
            type: "standard",
            shape: "rectangular",
            text: "continue_with",
            width: "100%",
          }
        );
        google.accounts.id.prompt();
      }
    }, 500);
  }, []);

  useEffect(() => {
    document.body.style.background = "#0a0c13";
    document.body.style.color = "#f1f1f8";
    return () => {
      document.body.style.background = "";
      document.body.style.color = "";
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => {
      if (window.google && document.getElementById("googleButton")) {
        google.accounts.id.initialize({
          client_id:
            "286322794195-c13r4m1bso49nhb4kjo6t9oo344jl0ku.apps.googleusercontent.com",
          callback: handleCredentialResponse,
        });
        google.accounts.id.renderButton(
          document.getElementById("googleButton"),
          {
            theme: "outline",
            size: "large",
            type: "standard",
            shape: "rectangular",
            text: "continue_with",
            width: "100%",
          }
        );
        google.accounts.id.prompt();
      }
    }, 500);
  }, [location.pathname]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const response = await http({
        method: "POST",
        url: "/login",
        data: {
          email: email,
          password: password,
        },
      });

      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Login successful!",
        showConfirmButton: false,
        timer: 1500,
      });

      localStorage.setItem("access_token", response.data.access_token);
      localStorage.setItem("userId", response.data.userId);
      localStorage.setItem("user_status", response.data.status || "basic");

      navigate("/");
    } catch (error) {
      console.log(error.response.data, "error");
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error.response.data.message || "Something went wrong!",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add this function to prevent full page reload when navigating to register
  const handleLinkClick = (event, to) => {
    event.preventDefault();
    navigate(to);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <motion.div
          className="auth-panel info-panel"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="logo">
            <motion.div
              className="logo-icon"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              M
            </motion.div>
            <motion.h2
              className="logo-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              MoFlix
            </motion.h2>
          </div>

          <motion.div
            className="welcome-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <h1>Welcome Back</h1>
            <p>
              Sign in to continue your movie journey with unlimited access to
              films and exclusive features.
            </p>
          </motion.div>

          <motion.div
            className="features"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <div className="feature-item">
              <div className="feature-icon">🎬</div>
              <div className="feature-text">
                <h3>Extensive Library</h3>
                <p>Access thousands of movies across all genres</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📱</div>
              <div className="feature-text">
                <h3>Watch Anywhere</h3>
                <p>Stream on any device, anytime</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🤖</div>
              <div className="feature-text">
                <h3>AI Recommendations</h3>
                <p>Get personalized movie suggestions</p>
              </div>
            </div>
          </motion.div>

          <div className="decoration">
            <div className="decoration-circle"></div>
            <div className="decoration-grid"></div>
          </div>
        </motion.div>

        <motion.div
          className="auth-panel form-panel"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="form-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h2>Sign In</h2>
            <p>Welcome back! Please enter your details.</p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">
                  <FaEnvelope className="input-icon" /> Email
                </label>
                <div className="input-container">
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="password-header">
                  <label htmlFor="password">
                    <FaLock className="input-icon" /> Password
                  </label>
                  <a href="#" className="forgot-password">
                    Forgot password?
                  </a>
                </div>
                <div className="input-container">
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                  />
                  <span className="checkmark"></span>
                  <span>Remember me for 30 days</span>
                </label>
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
                    <span>Signing in...</span>
                  </>
                ) : (
                  "Sign in"
                )}
              </motion.button>
            </form>

            <div className="separator">
              <span>or continue with</span>
            </div>

            <div className="social-login">
              <div id="googleButton" className="google-button-container"></div>
            </div>

            <div className="auth-footer">
              <p>
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="auth-link"
                  onClick={(e) => handleLinkClick(e, "/register")}
                >
                  Sign up
                </Link>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--color-background);
          padding: 20px;
        }

        .auth-container {
          display: flex;
          width: 100%;
          max-width: 1200px;
          height: 85vh;
          max-height: 800px;
          border-radius: var(--radius-xl);
          overflow: hidden;
          box-shadow: var(--shadow-lg);
          position: relative;
        }

        .auth-panel {
          flex: 1;
          padding: 40px;
          position: relative;
          overflow: hidden;
        }

        .info-panel {
          background: linear-gradient(
            135deg,
            rgba(99, 102, 241, 0.8) 0%,
            rgba(109, 40, 217, 0.8) 100%
          );
          color: white;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 60px;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: white;
          color: var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.2rem;
        }

        .logo-text {
          font-size: 1.8rem;
          font-weight: 700;
          margin: 0;
        }

        .welcome-content {
          max-width: 80%;
          margin-bottom: 40px;
        }

        .welcome-content h1 {
          font-size: 2.8rem;
          font-weight: 700;
          margin-bottom: 20px;
        }

        .welcome-content p {
          font-size: 1.1rem;
          opacity: 0.8;
          line-height: 1.6;
        }

        .features {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-top: auto;
          margin-bottom: 40px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 16px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(5px);
          padding: 16px;
          border-radius: var(--radius-lg);
        }

        .feature-icon {
          font-size: 1.5rem;
          background: rgba(255, 255, 255, 0.2);
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-lg);
          flex-shrink: 0;
        }

        .feature-text h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
        }

        .feature-text p {
          margin: 0;
          font-size: 0.9rem;
          opacity: 0.8;
        }

        .decoration {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          overflow: hidden;
          z-index: -1;
        }

        .decoration-circle {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.1) 0%,
            rgba(255, 255, 255, 0.05) 100%
          );
          top: -150px;
          right: -100px;
        }

        .decoration-grid {
          position: absolute;
          width: 100%;
          height: 100%;
          background-image: linear-gradient(
              rgba(255, 255, 255, 0.05) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.05) 1px,
              transparent 1px
            );
          background-size: 30px 30px;
          left: 0;
          top: 0;
        }

        .form-panel {
          background: rgba(20, 23, 43, 0.7);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .form-container {
          width: 100%;
          max-width: 400px;
          padding: 20px;
        }

        .form-container h2 {
          font-size: 2rem;
          font-weight: 600;
          margin-bottom: 10px;
          color: white;
        }

        .form-container p {
          color: var(--color-text-secondary);
          margin-bottom: 30px;
        }

        .form-group {
          margin-bottom: 25px;
        }

        .form-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          color: var(--color-text);
          font-weight: 500;
        }

        .input-icon {
          color: var(--color-primary);
        }

        .input-container {
          position: relative;
        }

        .input-container input {
          width: 100%;
          padding: 12px 16px;
          border-radius: var(--radius-md);
          background-color: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 1rem;
          transition: all 0.2s ease;
        }

        .input-container input:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
          outline: none;
        }

        .input-container input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        .password-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .forgot-password {
          color: var(--color-primary-light);
          font-size: 0.9rem;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .forgot-password:hover {
          color: white;
        }

        .checkbox-group {
          display: flex;
          align-items: center;
        }

        .checkbox-container {
          display: flex;
          align-items: center;
          cursor: pointer;
          user-select: none;
          font-size: 0.9rem;
          color: var(--color-text-secondary);
          gap: 8px;
        }

        .checkbox-container input {
          position: absolute;
          opacity: 0;
          cursor: pointer;
          height: 0;
          width: 0;
        }

        .checkmark {
          height: 18px;
          width: 18px;
          background-color: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          display: inline-block;
          position: relative;
          transition: all 0.2s ease;
        }

        .checkbox-container:hover .checkmark {
          border-color: var(--color-primary-light);
        }

        .checkbox-container input:checked ~ .checkmark {
          background-color: var(--color-primary);
          border-color: var(--color-primary);
        }

        .checkmark:after {
          content: "";
          position: absolute;
          display: none;
          left: 5px;
          top: 1px;
          width: 5px;
          height: 10px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }

        .checkbox-container input:checked ~ .checkmark:after {
          display: block;
        }

        .submit-button {
          width: 100%;
          padding: 12px;
          border-radius: var(--radius-md);
          background: var(--gradient-primary);
          color: white;
          font-weight: 600;
          font-size: 1rem;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .submit-button:hover {
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner.small {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top: 2px solid white;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .separator {
          display: flex;
          align-items: center;
          margin: 30px 0;
          color: var(--color-text-secondary);
        }

        .separator::before,
        .separator::after {
          content: "";
          flex: 1;
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
        }

        .separator span {
          padding: 0 15px;
          font-size: 0.9rem;
        }

        .social-login {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-bottom: 30px;
        }

        .google-button-container {
          width: 100%;
          display: flex;
          justify-content: center;
        }

        .auth-footer {
          text-align: center;
          color: var(--color-text-secondary);
          font-size: 0.95rem;
        }

        .auth-link {
          color: white;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .auth-link:hover {
          color: var(--color-primary-light);
        }

        @media (max-width: 768px) {
          .auth-container {
            flex-direction: column;
            height: auto;
            max-height: none;
          }

          .info-panel {
            padding: 30px 20px;
            max-height: 500px;
          }

          .welcome-content h1 {
            font-size: 2rem;
          }

          .features {
            gap: 10px;
          }

          .feature-item {
            padding: 12px;
          }

          .feature-icon {
            width: 40px;
            height: 40px;
            font-size: 1.2rem;
          }
        }
      `}</style>
    </div>
  );
}
