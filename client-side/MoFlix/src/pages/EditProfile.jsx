import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import http from "../lib/http";
import Swal from "sweetalert2";

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
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow">
            <div className="card-header bg-dark text-white">
              <h3 className="mb-0">
                {isCurrentUserProfile
                  ? "Edit Your Profile"
                  : "Edit User Profile"}
              </h3>
            </div>

            <div className="card-body">
              {isLoading ? (
                <div className="text-center my-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading profile data...</p>
                </div>
              ) : (
                <>
                  {/* Membership status indicator - just showing status, no upgrade button */}
                  <div
                    className={`card mb-4 ${
                      userStatus === "premium" ? "border-warning" : ""
                    }`}
                  >
                    <div
                      className={`card-header ${
                        userStatus === "premium"
                          ? "bg-warning text-dark"
                          : "bg-light"
                      }`}
                    >
                      <h5 className="mb-0">
                        <i
                          className={`bi ${
                            userStatus === "premium"
                              ? "bi-star-fill"
                              : "bi-star"
                          } me-2`}
                        ></i>
                        Membership Status
                      </h5>
                    </div>
                    <div className="card-body">
                      <h6>
                        Current Plan:{" "}
                        <strong>
                          {userStatus === "premium" ? "Premium" : "Basic"}
                        </strong>
                      </h6>

                      {userStatus === "premium" ? (
                        <p className="mb-0">
                          You're enjoying unlimited watchlist items and premium
                          features!
                        </p>
                      ) : (
                        <p className="mb-0">
                          Basic users are limited to 5 watchlist items. Upgrade
                          via the button in the navigation bar.
                        </p>
                      )}
                    </div>
                  </div>

                  <form onSubmit={handleSubmit}>
                    {error && (
                      <div className="alert alert-danger" role="alert">
                        {error}
                      </div>
                    )}

                    <h5 className="mb-3">Account Information</h5>

                    <div className="mb-3">
                      <label htmlFor="username" className="form-label">
                        Username
                      </label>
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

                    <div className="mb-4">
                      <label htmlFor="email" className="form-label">
                        Email
                      </label>
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

                    {isCurrentUserProfile && (
                      <>
                        <h5 className="mb-3 mt-4">Change Password</h5>

                        <div className="mb-3">
                          <label htmlFor="newPassword" className="form-label">
                            New Password
                          </label>
                          <input
                            type="password"
                            className="form-control"
                            id="newPassword"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            autoComplete="new-password"
                          />
                        </div>

                        <div className="mb-4">
                          <label htmlFor="confirmPassword" className="form-label">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            className="form-control"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            autoComplete="new-password"
                          />
                        </div>
                      </>
                    )}

                    <div className="d-flex justify-content-between mt-4">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => navigate(-1)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
