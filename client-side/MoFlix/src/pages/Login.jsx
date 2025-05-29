import { useEffect, useState } from "react";
import http from "../lib/http";
import { Navigate, useNavigate, Link } from "react-router";
import Swal from "sweetalert2";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

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

  const handleSubmit = async (event) => {
    event.preventDefault();
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
    }
  };

  return (
    <div
      className="login-page"
      style={{
        height: "100vh",
        display: "flex",
        backgroundColor: "#f5f5f5",
      }}
    >
      {/* Left Section */}
      <div
        className="left-panel"
        style={{
          flex: "1",
          backgroundColor: "#151c2c",
          color: "white",
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div className="logo" style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.8rem" }}>MoFlix</h2>
        </div>

        <div className="welcome-text" style={{ maxWidth: "400px" }}>
          <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>
            Welcome to MoFlix
          </h1>
          <p style={{ fontSize: "1.2rem", opacity: "0.8", lineHeight: "1.6" }}>
            Your ultimate movie experience starts here. Discover, save, and
            enjoy your favorite films.
          </p>
        </div>

        <div
          className="illustration"
          style={{ textAlign: "center", marginTop: "2rem" }}
        >
          <img
            src="https://cdn.pixabay.com/photo/2015/09/02/12/58/popcorn-918974_1280.png"
            alt="Movie illustration"
            style={{ width: "80%", maxWidth: "300px" }}
          />
        </div>

        <div
          className="copyright"
          style={{ fontSize: "0.9rem", opacity: "0.6", marginTop: "2rem" }}
        >
          © 2023 MoFlix. All rights reserved.
        </div>
      </div>

      {/* Right Section */}
      <div
        className="right-panel"
        style={{
          flex: "1",
          backgroundColor: "#ffffff",
          padding: "2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          className="login-form-container"
          style={{ width: "100%", maxWidth: "400px" }}
        >
          <div className="text-center mb-4">
            <h2
              style={{ fontSize: "2rem", fontWeight: "600", color: "#151c2c" }}
            >
              Log in to your account
            </h2>
            <p style={{ color: "#6c757d" }}>
              Welcome back! Please enter your details.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="form-label"
                style={{ fontWeight: "500", marginBottom: "0.5rem" }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control form-control-lg"
                id="email"
                placeholder="Enter your email"
                style={{ padding: "0.75rem", borderRadius: "0.5rem" }}
                required
              />
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label
                  htmlFor="password"
                  className="form-label mb-0"
                  style={{ fontWeight: "500" }}
                >
                  Password
                </label>
                <a
                  href="#"
                  className="text-decoration-none"
                  style={{ color: "#0d6efd", fontSize: "0.9rem" }}
                >
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control form-control-lg"
                id="password"
                placeholder="••••••••"
                style={{ padding: "0.75rem", borderRadius: "0.5rem" }}
                required
              />
            </div>

            <div className="mb-4 form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="rememberMe"
              />
              <label
                className="form-check-label"
                htmlFor="rememberMe"
                style={{ fontSize: "0.9rem" }}
              >
                Remember me for 30 days
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 mb-3"
              style={{
                padding: "0.75rem",
                borderRadius: "0.5rem",
                fontWeight: "500",
                fontSize: "1rem",
                backgroundColor: "#151c2c",
                border: "none",
              }}
            >
              Sign in
            </button>

            <div className="separator my-4 text-center position-relative">
              <span
                style={{
                  backgroundColor: "white",
                  padding: "0 10px",
                  position: "relative",
                  zIndex: "1",
                  color: "#6c757d",
                }}
              >
                or continue with
              </span>
              <hr
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "0",
                  right: "0",
                  margin: "0",
                  zIndex: "0",
                }}
              />
            </div>

            <div
              className="social-login mb-4"
              style={{ display: "flex", justifyContent: "center" }}
            >
              <div id="googleButton" style={{ width: "100%" }}></div>
            </div>

            <div className="text-center">
              <p
                className="mb-0"
                style={{ fontSize: "0.95rem", color: "#6c757d" }}
              >
                Don't have an account?
                <Link
                  to="/register"
                  className="text-decoration-none"
                  style={{
                    color: "#151c2c",
                    fontWeight: "500",
                    marginLeft: "5px",
                  }}
                >
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
