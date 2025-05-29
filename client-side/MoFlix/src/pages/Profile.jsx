import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router";
import http from "../lib/http";
import Swal from "sweetalert2";
import Button from "../component/Button";
import axios from "axios";


export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserData();
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
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow">
            <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
              <h3 className="mb-0">User Profile</h3>
              <Button
                title="Logout"
                variant="outline-danger"
                onClick={handleLogout}
              />
            </div>

            <div className="card-body">
              {isLoading ? (
                <div className="text-center my-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading profile data...</p>
                </div>
              ) : error ? (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              ) : (
                user && (
                  <>
                    <div className="card mb-3">
                      <div className="card-header bg-light">
                        <h5 className="mb-0">Account Information</h5>
                      </div>
                      <div className="card-body">
                        <div className="row mb-3">
                          <div className="col-4 fw-bold">Username:</div>
                          <div className="col-8">{user.username}</div>
                        </div>
                        <div className="row mb-3">
                          <div className="col-4 fw-bold">Email:</div>
                          <div className="col-8">{user.email}</div>
                        </div>
                        <div className="row mb-3">
                          <div className="col-4 fw-bold">Account Type:</div>
                          <div className="col-8">
                            <span
                              className={`badge ${
                                user.status === "premium"
                                  ? "bg-warning text-dark"
                                  : "bg-secondary"
                              }`}
                            >
                              {user.status || "Basic"}
                            </span>
                          </div>
                        </div>
                        {user.createdAt && (
                          <div className="row mb-3">
                            <div className="col-4 fw-bold">Member Since:</div>
                            <div className="col-8">
                              {formatDate(user.createdAt)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="d-grid gap-2">
                      <Link
                        to={`/users/${user.id}/edit`}
                        className="btn btn-primary"
                      >
                        Edit Profile
                      </Link>

                      <div className="mt-4">
                        <h5 className="text-danger mb-3">Danger Zone</h5>
                        <div className="card border-danger">
                          <div className="card-body">
                            <h6 className="card-title">
                              Deactivate Your Account
                            </h6>
                            <p className="card-text text-muted small">
                              Once you delete your account, there is no going
                              back. Please be certain.
                            </p>
                            <button
                              className="btn btn-outline-danger"
                              onClick={handleDeactivateAccount}
                            >
                              Deactivate Account
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
