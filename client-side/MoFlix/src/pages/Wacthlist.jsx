import { useState, useEffect } from "react";
import { Link } from "react-router";
import http from "../lib/http";
import Swal from "sweetalert2";

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userStatus, setUserStatus] = useState("basic"); // Default to basic

  useEffect(() => {
    fetchWatchlist();
    // Get user status from localStorage
    const status = localStorage.getItem("user_status") || "basic";
    setUserStatus(status);
  }, []);

  const fetchWatchlist = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await http({
        method: "GET",
        url: "/watchlists",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      setWatchlist(response.data);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      setError(
        error.response?.data?.message ||
          "Failed to load watchlist. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Check if the user has reached their watchlist limit
  const hasReachedWatchlistLimit = () => {
    return userStatus === "basic" && watchlist.length >= 5;
  };

  // Display a message about watchlist limits
  const renderWatchlistLimitMessage = () => {
    if (userStatus === "basic") {
      return (
        <div
          className={`alert ${
            hasReachedWatchlistLimit() ? "alert-warning" : "alert-info"
          } mb-3`}
        >
          <i className="bi bi-info-circle me-2"></i>
          {hasReachedWatchlistLimit()
            ? "You've reached the limit of 5 movies in your watchlist. Upgrade to premium for unlimited watchlist items!"
            : `Basic users can add up to 5 movies to watchlist (${watchlist.length}/5 used)`}
        </div>
      );
    }
    return null;
  };

  const handleRemoveFromWatchlist = async (watchlistId) => {
    try {
      const result = await Swal.fire({
        title: "Remove from watchlist?",
        text: "This movie will be removed from your watchlist",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, remove it!",
      });

      if (result.isConfirmed) {
        await http({
          method: "DELETE",
          url: `/watchlists/${watchlistId}`,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        Swal.fire(
          "Removed!",
          "Movie has been removed from your watchlist.",
          "success"
        );

        fetchWatchlist();
      }
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text:
          error.response?.data?.message || "Failed to remove from watchlist",
      });
    }
  };

  const handleClearAllWatchlist = async () => {
    try {
      const result = await Swal.fire({
        title: "Clear entire watchlist?",
        text: "This will remove all movies from your watchlist. This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, clear everything!",
      });

      if (result.isConfirmed) {
        const token = localStorage.getItem("access_token");
        const deletePromises = watchlist.map((item) =>
          http({
            method: "DELETE",
            url: `/watchlists/${item.id}`,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        );

        await Promise.all(deletePromises);

        Swal.fire("Cleared!", "Your watchlist has been emptied.", "success");

        fetchWatchlist();
      }
    } catch (error) {
      console.error("Error clearing watchlist:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error.response?.data?.message || "Failed to clear watchlist",
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

  // Update the upgrade button to use the payment system
  const handleUpgradeAccount = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const { data } = await http({
        method: "GET",
        url: "/payment/midtrans/initiate",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      window.snap.pay(data.transactionToken, {
        onSuccess: async function (result) {
          await http({
            method: "PATCH",
            url: `/users/me/upgrade`,
            data: { orderId: data.orderId },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          // Update local storage and state
          localStorage.setItem("user_status", "premium");
          setUserStatus("premium");

          Swal.fire({
            icon: "success",
            title: "Upgrade Successful!",
            text: "You can now add unlimited movies to your watchlist!",
            confirmButtonText: "Great!",
          }).then(() => {
            // Refresh the watchlist to update UI
            fetchWatchlist();
          });
        },
        onError: function (result) {
          Swal.fire({
            icon: "error",
            title: "Payment Failed",
            text: "There was an issue processing your payment. Please try again.",
          });
        },
        onClose: function () {
          Swal.fire({
            icon: "info",
            title: "Payment Canceled",
            text: "You closed the payment window. You can try upgrading again anytime.",
          });
        },
      });
    } catch (error) {
      console.error("Error initiating payment:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to initiate payment. Please try again.",
      });
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>My Watchlist</h1>

        {!isLoading && !error && watchlist.length > 0 && (
          <button className="btn btn-danger" onClick={handleClearAllWatchlist}>
            <i className="bi bi-trash me-2"></i>
            Clear All Watchlist
          </button>
        )}
      </div>

      {/* Display watchlist limit message */}
      {!isLoading && !error && renderWatchlistLimitMessage()}

      {isLoading && (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading your watchlist...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!isLoading && !error && watchlist.length === 0 && (
        <div className="text-center py-5">
          <div className="mb-4">
            <i
              className="bi bi-bookmark-x"
              style={{ fontSize: "4rem", color: "#6c757d" }}
            ></i>
          </div>
          <h3>Your watchlist is empty</h3>
          <p className="text-muted">
            Browse movies and add some to your watchlist
          </p>
          <Link to="/" className="btn btn-primary mt-3">
            Browse Movies
          </Link>
        </div>
      )}

      {userStatus === "basic" && hasReachedWatchlistLimit() && (
        <div className="text-center mb-4">
          <button className="btn btn-warning" onClick={handleUpgradeAccount}>
            <i className="bi bi-star-fill me-2"></i>
            Upgrade to Premium
          </button>
        </div>
      )}

      {!isLoading && !error && watchlist.length > 0 && (
        <div className="row">
          {watchlist.map((item) => (
            <div key={item.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="position-relative">
                  <img
                    src={item.Movie.posterfilm}
                    className="card-img-top"
                    alt={item.Movie.title}
                    style={{ height: "300px", objectFit: "cover" }}
                  />
                  <button
                    className="btn btn-sm btn-danger position-absolute"
                    style={{ top: "10px", right: "10px" }}
                    onClick={() => handleRemoveFromWatchlist(item.id)}
                    title="Remove from watchlist"
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>

                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{item.Movie.title}</h5>
                  <p className="card-text text-muted small">
                    <i className="bi bi-calendar-event me-2"></i>
                    {formatDate(item.Movie.release_date)}
                  </p>
                  {item.Movie.genres && (
                    <div className="mb-2">
                      {item.Movie.genres.map((genre, index) => (
                        <span
                          key={index}
                          className="badge bg-secondary me-1 mb-1"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  )}
                  {item.Movie.vote_average && (
                    <div className="mb-3 d-flex align-items-center">
                      <i className="bi bi-star-fill text-warning me-1"></i>
                      <span>{item.Movie.vote_average.toFixed(1)}/10</span>
                    </div>
                  )}
                  <p className="card-text">
                    {item.Movie.description
                      ? item.Movie.description.substring(0, 100) + "..."
                      : "No description available"}
                  </p>
                  <div className="mt-auto">
                    <button
                      className="btn btn-danger mb-2 w-100"
                      onClick={() => handleRemoveFromWatchlist(item.id)}
                    >
                      <i className="bi bi-trash me-2"></i>
                      Remove from Watchlist
                    </button>
                    <Link
                      to={`/movies/${item.Movie.id}`}
                      className="btn btn-outline-primary w-100"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
                <div className="card-footer bg-white">
                  <small className="text-muted">
                    Added on {formatDate(item.createdAt)}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
