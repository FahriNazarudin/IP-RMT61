import { useState, useEffect } from "react";
import http from "../lib/http";
import { Navigate, useNavigate, Link } from "react-router";
import Swal from "sweetalert2";

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const access_token = localStorage.getItem("access_token");

  if (access_token) {
    return <Navigate to="/" />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await http({
        method: "POST",
        url: "/register",
        data: {
          username: `${formData.firstName} ${formData.lastName}`.trim(),
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
      localStorage.setItem("user_status", backendResponse.data.status || "basic");

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
        text: error.response?.data?.message || "Something went wrong with Google signup",
      });
    }
  }

  useEffect(() => {
    // Initialize Google Sign-In after component mounts
    setTimeout(() => {
      if (window.google && document.getElementById("googleSignupButton")) {
        google.accounts.id.initialize({
          client_id: "286322794195-c13r4m1bso49nhb4kjo6t9oo344jl0ku.apps.googleusercontent.com",
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
  }, []);

  return (
    <div className="register-page"
      style={{
        minHeight: "100vh",
        display: "flex",
        backgroundColor: "#000", // Black background
        color: "#fff"
      }}>
      {/* Left Panel - Purple Gradient */}
      <div className="left-panel"
        style={{
          flex: "1",
          background: "linear-gradient(180deg, #C95BFA 0%, #5A0D87 100%)",
          padding: "3rem 2rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          borderRadius: "20px 0 0 20px"
        }}>
        <div className="logo-container"
          style={{ marginBottom: "3rem" }}>
          <div className="logo-circle"
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              border: "2px solid white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto"
            }}>
            <span style={{ fontWeight: "bold" }}>M</span>
          </div>
          <h3 style={{ marginTop: "1rem" }}>MoFlix</h3>
        </div>

        <div className="welcome-text"
          style={{ maxWidth: "400px" }}>
          <h1 style={{
            fontSize: "2.5rem",
            marginBottom: "1rem",
            fontWeight: "600"
          }}>
            Get Started with Us
          </h1>
          <p style={{
            fontSize: "1rem",
            opacity: "0.9",
            lineHeight: "1.6",
            marginBottom: "2rem"
          }}>
            Complete these easy steps to register your account.
          </p>
        </div>

        <div className="steps-container"
          style={{
            width: "100%",
            maxWidth: "350px",
            textAlign: "left"
          }}>
          <div className="step"
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "1rem",
              padding: "1rem",
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: "10px"
            }}>
            <div className="step-number"
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                backgroundColor: "#fff",
                color: "#5A0D87",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                marginRight: "1rem"
              }}>1</div>
            <span>Sign up your account</span>
          </div>

          <div className="step"
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "1rem",
              padding: "1rem",
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: "10px"
            }}>
            <div className="step-number"
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.3)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                marginRight: "1rem"
              }}>2</div>
            <span>Set up your profile</span>
          </div>

          <div className="step"
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "1rem",
              padding: "1rem",
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: "10px"
            }}>
            <div className="step-number"
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.3)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                marginRight: "1rem"
              }}>3</div>
            <span>Start exploring movies</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Sign Up Form */}
      <div className="right-panel"
        style={{
          flex: "1",
          backgroundColor: "#000", // Black background
          padding: "3rem 2rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center"
        }}>
        <div className="signup-container"
          style={{
            width: "100%",
            maxWidth: "500px",
            margin: "0 auto"
          }}>
          <h2 style={{
            fontSize: "2rem",
            marginBottom: "1rem",
            fontWeight: "600"
          }}>
            Sign Up Account
          </h2>
          <p style={{ color: "#aaa", marginBottom: "2rem" }}>
            Enter your personal data to create your account.
          </p>

          <div className="social-login-buttons"
            style={{
              display: "flex",
              gap: "1rem",
              marginBottom: "2rem"
            }}>
            <div id="googleSignupButton"
              style={{
                flex: "1",
                borderRadius: "8px",
                overflow: "hidden"
              }}></div>

            <button style={{
              flex: "1",
              padding: "10px",
              border: "1px solid #444",
              borderRadius: "8px",
              backgroundColor: "transparent",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              cursor: "pointer"
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
              </svg>
              Github
            </button>
          </div>

          <div className="separator"
            style={{
              display: "flex",
              alignItems: "center",
              margin: "1.5rem 0",
              color: "#aaa"
            }}>
            <div style={{ flex: "1", height: "1px", backgroundColor: "#444" }}></div>
            <span style={{ padding: "0 1rem" }}>Or</span>
            <div style={{ flex: "1", height: "1px", backgroundColor: "#444" }}></div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row"
              style={{ marginBottom: "1rem" }}>
              <div className="col-md-6"
                style={{ marginBottom: "1rem" }}>
                <label htmlFor="firstName"
                  style={{
                    marginBottom: "0.5rem",
                    display: "block",
                    fontWeight: "500"
                  }}>
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="eg. John"
                  className="form-control"
                  style={{
                    padding: "0.75rem 1rem",
                    backgroundColor: "#111",
                    border: "1px solid #333",
                    color: "#fff",
                    borderRadius: "8px",
                    width: "100%"
                  }}
                  required
                />
              </div>
              <div className="col-md-6"
                style={{ marginBottom: "1rem" }}>
                <label htmlFor="lastName"
                  style={{
                    marginBottom: "0.5rem",
                    display: "block",
                    fontWeight: "500"
                  }}>
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="eg. Francisco"
                  className="form-control"
                  style={{
                    padding: "0.75rem 1rem",
                    backgroundColor: "#111",
                    border: "1px solid #333",
                    color: "#fff",
                    borderRadius: "8px",
                    width: "100%"
                  }}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="email"
                style={{
                  marginBottom: "0.5rem",
                  display: "block",
                  fontWeight: "500"
                }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="eg. johnfrans@gmail.com"
                className="form-control"
                style={{
                  padding: "0.75rem 1rem",
                  backgroundColor: "#111",
                  border: "1px solid #333",
                  color: "#fff",
                  borderRadius: "8px",
                  width: "100%"
                }}
                required
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="password"
                style={{
                  marginBottom: "0.5rem",
                  display: "block",
                  fontWeight: "500"
                }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="form-control"
                  style={{
                    padding: "0.75rem 1rem",
                    backgroundColor: "#111",
                    border: "1px solid #333",
                    color: "#fff",
                    borderRadius: "8px",
                    width: "100%"
                  }}
                  minLength="8"
                  required
                />
                <button
                  type="button"
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: "1rem",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#aaa",
                    cursor: "pointer"
                  }}
                >
                  <i className="bi bi-eye"></i>
                </button>
              </div>
              <p style={{
                fontSize: "0.8rem",
                color: "#aaa",
                marginTop: "0.5rem"
              }}>
                Must be at least 8 characters.
              </p>
            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: "#C95BFA",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontWeight: "500",
                fontSize: "1rem",
                cursor: "pointer",
                marginTop: "1.5rem"
              }}
            >
              Sign Up
            </button>

            <div style={{
              textAlign: "center",
              marginTop: "1.5rem"
            }}>
              <p style={{ color: "#aaa" }}>
                Already have an account?
                <Link
                  to="/login"
                  style={{
                    color: "#C95BFA",
                    textDecoration: "none",
                    fontWeight: "500",
                    marginLeft: "0.5rem"
                  }}
                >
                  Log in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
