import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import http from "../lib/http";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaSave,
  FaArrowLeft,
  FaCrown,
  FaStar,
} from "react-icons/fa";

export default function EditProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userStatus, setUserStatus] = useState("basic");

  useEffect(() => {
    // Get user status from localStorage
    const status = localStorage.getItem("user_status") || "basic";
    setUserStatus(status);

    const fetchUserData = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/login");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const tokenPayload = JSON.parse(atob(token.split(".")[1]));
        const loggedInUserId = tokenPayload.id || tokenPayload.userId;
        setCurrentUserId(loggedInUserId);

        const targetUserId = id || loggedInUserId;

        const response = await http({
          method: "GET",
          url: `/users/${targetUserId}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.data) {
          throw new Error("No user data returned");
        }

        setFormData({
          username: response.data.username || "",
          email: response.data.email || "",
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } catch (error) {
        console.error("Error fetching user data:", error);

        if (error.response?.status === 403) {
          Swal.fire({
            icon: "error",
            title: "Permission Denied",
            text: "You don't have permission to view this user's profile.",
          });
          navigate("/");
          return;
        }

        setError("Failed to load user profile. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
    document.body.style.background = "#0a0c13";
    document.body.style.color = "#f1f1f8";
    return () => {
      document.body.style.background = "";
      document.body.style.color = "";
    };
  }, [id, navigate]);

  const isCurrentUserProfile = !id || id === currentUserId?.toString();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    if (
      formData.newPassword &&
      formData.newPassword !== formData.confirmPassword
    ) {
      setError("New passwords don't match");
      setIsSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const targetUserId = id || currentUserId;

      let requestData = {
        username: formData.username,
        email: formData.email,
      };

      if (formData.currentPassword && isCurrentUserProfile) {
        requestData.currentPassword = formData.currentPassword;
        requestData.newPassword = formData.newPassword;
      }

      await http({
        method: "PUT",
        url: `/users/${targetUserId}`,
        data: requestData,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Profile updated successfully!",
        timer: 2000,
        showConfirmButton: false,
      });

      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      if (!isCurrentUserProfile) {
        setTimeout(() => navigate("/admin/users"), 2000);
      }
    } catch (error) {
      console.error("Error updating profile:", error);

      if (error.response?.status === 409) {
        setError("Username or email already exists. Please choose another.");
      } else if (error.response?.status === 401) {
        setError("Current password is incorrect.");
      } else {
        setError(
          error.response?.data?.message ||
            "Failed to update profile. Please try again."
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      className="page-container mt-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="edit-profile-container">
        <motion.div
          className="edit-profile-header"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-gradient">
            {isCurrentUserProfile ? "Edit Your Profile" : "Edit User Profile"}
          </h1>
          <p className="edit-profile-subtitle">
            Update your account information and preferences
          </p>
        </motion.div>

        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">Loading profile data...</p>
          </div>
        ) : (
          <motion.div
            className="edit-profile-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Membership status indicator */}
            <motion.div
              className={`membership-card ${
                userStatus === "premium" ? "premium" : ""
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="membership-header">
                <div className="membership-icon">
                  {userStatus === "premium" ? (
                    <FaCrown size={24} />
                  ) : (
                    <FaStar size={24} />
                  )}
                </div>
                <h2 className="membership-title">Membership Status</h2>
              </div>

              <div className="membership-content">
                <div className="membership-info">
                  <h3>
                    Current Plan:{" "}
                    <span className="plan-name">
                      {userStatus === "premium" ? "Premium" : "Basic"}
                    </span>
                  </h3>
                  {userStatus === "premium" ? (
                    <p className="membership-description">
                      You're enjoying unlimited watchlist items and premium
                      features!
                    </p>
                  ) : (
                    <p className="membership-description">
                      Basic users are limited to 5 watchlist items. Upgrade via
                      the button in the navigation bar.
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div
              className="edit-form-container card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="form-error">
                    <p>{error}</p>
                  </div>
                )}

                <h3 className="form-section-title">Account Information</h3>

                <div className="form-group">
                  <label htmlFor="username" className="form-label">
                    <FaUser className="input-icon" /> Username
                  </label>
                  <div className="input-container">
                    <input
                      type="text"
                      className="form-control"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    <FaEnvelope className="input-icon" /> Email
                  </label>
                  <div className="input-container">
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {isCurrentUserProfile && (
                  <>
                    <h3 className="form-section-title password-section">
                      Change Password
                    </h3>

                    <div className="form-group">
                      <label htmlFor="currentPassword" className="form-label">
                        <FaLock className="input-icon" /> Current Password
                      </label>
                      <div className="input-container">
                        <input
                          type="password"
                          className="form-control"
                          id="currentPassword"
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleChange}
                          placeholder="Enter current password"
                        />
                      </div>
                      <div className="form-hint">
                        Leave blank if you don't want to change password
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="newPassword" className="form-label">
                        <FaLock className="input-icon" /> New Password
                      </label>
                      <div className="input-container">
                        <input
                          type="password"
                          className="form-control"
                          id="newPassword"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleChange}
                          placeholder="Enter new password"
                          autoComplete="new-password"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="confirmPassword" className="form-label">
                        <FaLock className="input-icon" /> Confirm New Password
                      </label>
                      <div className="input-container">
                        <input
                          type="password"
                          className="form-control"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm new password"
                          autoComplete="new-password"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="form-actions">
                  <motion.button
                    type="button"
                    className="btn-outline"
                    onClick={() => navigate(-1)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaArrowLeft size={16} /> Cancel
                  </motion.button>

                  <motion.button
                    type="submit"
                    className="btn-primary"
                    onClick={() => navigate(-1)}
                    disabled={isSaving}
                    whileHover={{ scale: isSaving ? 1 : 1.05 }}
                    whileTap={{ scale: isSaving ? 1 : 0.95 }}
                  >
                    {isSaving ? (
                      <>
                        <span className="spinner small"></span>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <FaSave size={16} /> Save Changes
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </div>

      <style jsx>{`
        .edit-profile-container {
          max-width: 700px;
          margin: 0 auto;
        }

        .edit-profile-header {
          margin-bottom: 30px;
        }

        .text-gradient {
          background: linear-gradient(135deg, #7f5af0 0%, #2cb67d 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .edit-profile-subtitle {
          color: #a7adc6;
          font-size: 1.1rem;
        }

        .edit-profile-content {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .membership-card {
          background: linear-gradient(
            135deg,
            rgba(34, 39, 54, 0.85) 0%,
            rgba(127, 90, 240, 0.1) 100%
          );
          border-radius: 16px;
          border: 1.5px solid #232946;
          padding: 25px;
          box-shadow: 0 4px 24px rgba(127, 90, 240, 0.1);
          transition: all 0.3s ease;
        }

        .membership-card.premium {
          background: linear-gradient(
            135deg,
            rgba(245, 158, 11, 0.13) 0%,
            rgba(245, 158, 11, 0.07) 100%
          );
          border: 1.5px solid #fbbf24;
        }

        .membership-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
        }

        .membership-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(
            135deg,
            rgba(127, 90, 240, 0.12) 0%,
            rgba(44, 182, 125, 0.12) 100%
          );
          color: ${userStatus === "premium" ? "#fbbf24" : "#7f5af0"};
        }

        .membership-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0;
          color: #fff;
        }

        .membership-content {
          padding-left: 65px;
        }

        .membership-info h3 {
          font-size: 1.1rem;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .plan-name {
          color: ${userStatus === "premium" ? "#fbbf24" : "#7f5af0"};
          font-weight: 600;
        }

        .membership-description {
          color: #a7adc6;
          margin: 0;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .edit-form-container {
          padding: 30px;
          background: rgba(34, 39, 54, 0.85);
          border-radius: 16px;
          border: 1.5px solid #232946;
          box-shadow: 0 4px 24px rgba(127, 90, 240, 0.1);
        }

        .form-error {
          background-color: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #f87171;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 25px;
        }

        .form-error p {
          margin: 0;
          font-size: 0.95rem;
        }

        .form-section-title {
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 25px;
          color: #7f5af0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .form-section-title.password-section {
          margin-top: 40px;
        }

        .form-group {
          margin-bottom: 25px;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
          font-weight: 500;
          color: #fff;
        }

        .input-icon {
          color: #7f5af0;
        }

        .input-container {
          position: relative;
        }

        .form-control {
          width: 100%;
          padding: 12px 15px;
          background-color: rgba(34, 39, 54, 0.7);
          border: 1.5px solid #232946;
          border-radius: 8px;
          color: #fff;
          font-size: 1rem;
          transition: all 0.2s ease;
        }

        .form-control:focus {
          border-color: #7f5af0;
          box-shadow: 0 0 0 3px rgba(127, 90, 240, 0.15);
          outline: none;
        }

        .form-control::placeholder {
          color: #a7adc6;
        }

        .form-hint {
          margin-top: 8px;
          font-size: 0.85rem;
          color: #a7adc6;
        }

        .form-actions {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          margin-top: 40px;
        }

        .btn-outline {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 24px;
          background: transparent;
          color: #7f5af0;
          border: 1.5px solid #7f5af0;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          flex: 1;
        }

        .btn-outline:hover {
          background: #7f5af0;
          color: #fff;
          border-color: #7f5af0;
        }

        .btn-primary {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(90deg, #7f5af0 0%, #2cb67d 100%);
          color: #fff;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          flex: 1;
          box-shadow: 0 2px 8px rgba(127, 90, 240, 0.1);
        }

        .btn-primary:hover:not(:disabled) {
          background: linear-gradient(90deg, #2cb67d 0%, #7f5af0 100%);
          color: #fff;
        }

        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner.small {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top: 2px solid white;
          animation: spin 1s linear infinite;
        }

        @media (max-width: 768px) {
          .form-actions {
            flex-direction: column;
          }

          .membership-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .membership-content {
            padding-left: 0;
          }
        }
      `}</style>
    </motion.div>
  );
}
