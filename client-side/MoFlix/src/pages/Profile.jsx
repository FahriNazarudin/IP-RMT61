import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router";
import http from "../lib/http";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaCrown,
  FaCalendarAlt,
  FaSignOutAlt,
  FaEdit,
  FaTrashAlt,
} from "react-icons/fa";

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserData();
    document.body.style.background = "#0a0c13";
    document.body.style.color = "#f1f1f8";
    return () => {
      document.body.style.background = "";
      document.body.style.color = "";
    };
  }, [id]);

  const fetchUserData = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let targetUserId = id;
      if (!targetUserId) {
        const tokenPayload = JSON.parse(atob(token.split(".")[1]));
        targetUserId = tokenPayload.id || tokenPayload.userId;
      }

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

      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);

      if (error.response?.status === 403) {
        Swal.fire({
          icon: "error",
          title: "Permission Denied",
          text: "You don't have permission to view this profile.",
        });
        navigate("/");
        return;
      }

      setError(
        error.response?.data?.message ||
          "Failed to load user profile. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const result = await Swal.fire({
        title: "Logout",
        text: "Are you sure you want to logout?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, logout",
      });

      if (result.isConfirmed) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("userId");
        localStorage.removeItem("status");
        Swal.fire({
          icon: "success",
          title: "Logged Out",
          text: "You have been successfully logged out.",
          timer: 1500,
          showConfirmButton: false,
        });

        navigate("/login");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong during logout. Please try again.",
      });
    }
  };

  const handleDeactivateAccount = async () => {
    try {
      const result = await Swal.fire({
        title: "Deactivate Account?",
        text: "Your account and all associated data will be permanently deleted. This action cannot be undone!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete my account!",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        const token = localStorage.getItem("access_token");
        await http({
          method: "DELETE",
          url: `/users/${user.id}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        localStorage.removeItem("access_token");
        localStorage.removeItem("userId");

        Swal.fire({
          icon: "success",
          title: "Account Deactivated",
          text: "Your account has been successfully deleted.",
          timer: 2000,
          showConfirmButton: false,
        });

        navigate("/login");
      }
    } catch (error) {
      console.error("Error deactivating account:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text:
          error.response?.data?.message ||
          "Failed to deactivate account. Please try again.",
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      className="page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="profile-container">
        <motion.div
          className="profile-header"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="header-content">
            <h1 className="text-gradient">Profile</h1>
            <p className="profile-subtitle">
              Manage your account details and preferences
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-outline"
            onClick={handleLogout}
          >
            <FaSignOutAlt size={16} /> Logout
          </motion.button>
        </motion.div>

        {isLoading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">Loading profile data...</p>
          </div>
        )}

        {error && (
          <div className="error-container">
            <div className="error-message">{error}</div>
          </div>
        )}

        {!isLoading && !error && user && (
          <div className="profile-content">
            <motion.div
              className="card profile-info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <div className="card-header">
                <div className="avatar-container">
                  <div className="avatar">
                    <span>{user.username.charAt(0).toUpperCase()}</span>
                  </div>
                </div>
                <div className="user-info">
                  <h2 className="username">{user.username}</h2>
                  <div className="membership-badge">
                    <FaCrown size={14} />
                    <span>
                      {user.status === "premium"
                        ? "Premium Member"
                        : "Basic Member"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="divider"></div>

              <div className="info-section">
                <h3 className="section-title">Account Information</h3>

                <div className="info-item">
                  <div className="info-icon">
                    <FaEnvelope size={18} />
                  </div>
                  <div className="info-content">
                    <span className="info-label">Email</span>
                    <span className="info-value">{user.email}</span>
                  </div>
                </div>

                {user.createdAt && (
                  <div className="info-item">
                    <div className="info-icon">
                      <FaCalendarAlt size={18} />
                    </div>
                    <div className="info-content">
                      <span className="info-label">Member Since</span>
                      <span className="info-value">
                        {formatDate(user.createdAt)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <motion.div
                className="action-buttons"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Link to={`/users/${user.id}/edit`} className="btn-primary">
                  <FaEdit size={16} /> Edit Profile
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              className="danger-zone"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              <h3 className="danger-title">Danger Zone</h3>
              <div className="card danger-card">
                <div className="danger-content">
                  <div>
                    <h4>Deactivate Account</h4>
                    <p>
                      All your data will be permanently deleted. This action
                      cannot be undone.
                    </p>
                  </div>
                  <motion.button
                    className="btn-danger"
                    onClick={handleDeactivateAccount}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaTrashAlt size={16} /> Deactivate
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      <style jsx>{`
        .profile-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .profile-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
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

        .profile-subtitle {
          color: #a7adc6;
          font-size: 1.1rem;
        }

        .btn-outline {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          background: transparent;
          color: #7f5af0;
          border: 1.5px solid #7f5af0;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(127, 90, 240, 0.08);
        }

        .btn-outline:hover {
          background: #7f5af0;
          color: #fff;
          border-color: #7f5af0;
          transform: translateY(-2px) scale(1.03);
        }

        .profile-content {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .profile-info {
          padding: 0;
          overflow: hidden;
          background: rgba(34, 39, 54, 0.7);
          border-radius: 18px;
          box-shadow: 0 4px 24px rgba(127, 90, 240, 0.1);
          border: 1.5px solid #222736;
        }

        .card-header {
          padding: 30px;
          display: flex;
          align-items: center;
          gap: 20px;
          background: linear-gradient(135deg, #232946 0%, #7f5af0 100%);
        }

        .avatar-container {
          position: relative;
        }

        .avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7f5af0 0%, #2cb67d 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: 600;
          color: white;
          box-shadow: 0 4px 15px rgba(127, 90, 240, 0.25);
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .username {
          font-size: 1.8rem;
          font-weight: 600;
          margin-bottom: 8px;
          color: #fff;
        }

        .membership-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 16px;
          border-radius: 20px;
          font-size: 1rem;
          font-weight: 600;
          background: linear-gradient(90deg, #fbbf24 0%, #f59e42 100%);
          color: #232946;
          border: none;
          box-shadow: 0 2px 8px rgba(251, 191, 36, 0.1);
          letter-spacing: 0.02em;
        }
        .membership-badge svg {
          color: #f59e42;
        }

        .divider {
          height: 1px;
          background: linear-gradient(90deg, #7f5af0 0%, #2cb67d 100%);
          margin: 0;
        }

        .info-section {
          padding: 30px;
        }

        .section-title {
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 20px;
          color: #7f5af0;
          letter-spacing: 0.01em;
        }

        .info-item {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          margin-bottom: 20px;
        }

        .info-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: linear-gradient(135deg, #7f5af0 0%, #2cb67d 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          flex-shrink: 0;
        }

        .info-content {
          display: flex;
          flex-direction: column;
        }

        .info-label {
          font-size: 0.95rem;
          color: #a7adc6;
          margin-bottom: 4px;
        }

        .info-value {
          font-size: 1.1rem;
          color: #fff;
        }

        .action-buttons {
          padding: 0 30px 30px;
        }

        .btn-primary {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 12px;
          background: linear-gradient(90deg, #7f5af0 0%, #2cb67d 100%);
          color: #fff;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          text-align: center;
          box-shadow: 0 2px 8px rgba(127, 90, 240, 0.1);
        }

        .btn-primary:hover {
          background: linear-gradient(90deg, #2cb67d 0%, #7f5af0 100%);
          color: #fff;
          transform: translateY(-2px) scale(1.03);
        }

        .danger-zone {
          margin-top: 10px;
        }

        .danger-title {
          color: #ef4444;
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 15px;
        }

        .danger-card {
          border: 1.5px solid #ef4444;
          background: rgba(239, 68, 68, 0.07);
          border-radius: 14px;
        }

        .danger-content {
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .danger-content h4 {
          font-size: 1.1rem;
          color: #ef4444;
          margin-bottom: 5px;
        }

        .danger-content p {
          color: #a7adc6;
          font-size: 0.95rem;
          margin-bottom: 0;
        }

        .btn-danger {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          background: linear-gradient(90deg, #ef4444 0%, #fbbf24 100%);
          color: #fff;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.1);
        }

        .btn-danger:hover {
          background: linear-gradient(90deg, #fbbf24 0%, #ef4444 100%);
          color: #fff;
          transform: translateY(-2px) scale(1.03);
        }

        @media (max-width: 768px) {
          .profile-header {
            flex-direction: column;
            gap: 20px;
          }

          .btn-outline {
            width: 100%;
            justify-content: center;
          }

          .card-header {
            flex-direction: column;
            text-align: center;
          }

          .danger-content {
            flex-direction: column;
            text-align: center;
          }

          .btn-danger {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </motion.div>
  );
}
