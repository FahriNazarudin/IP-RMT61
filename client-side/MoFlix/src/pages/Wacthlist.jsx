import { useState, useEffect } from "react";
import { Link } from "react-router";
import http from "../lib/http";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { FaStar, FaCalendarAlt, FaTrash, FaEye, FaCrown } from "react-icons/fa";

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

    document.body.style.background = "#0a0c13";
    document.body.style.color = "#f1f1f8";
    return () => {
      document.body.style.background = "";
      document.body.style.color = "";
    };
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
    <motion.div
      className="page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="watchlist-header">
        <div>
        </div>

        {!isLoading && !error && watchlist.length > 0 && (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="btn-danger-outline"
            onClick={handleClearAllWatchlist}
          >
            <FaTrash size={14} /> Clear All
          </motion.button>
        )}
      </div>

      {/* Display watchlist limit message */}
      {!isLoading && !error && userStatus === "basic" && (
        <motion.div
          className={`status-banner ${
            hasReachedWatchlistLimit() ? "warning" : "info"
          }`}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="banner-icon">
            {hasReachedWatchlistLimit() ? "⚠️" : "ℹ️"}
          </div>
          <div className="banner-content">
            <h4 className="banner-title">
              {hasReachedWatchlistLimit()
                ? "Watchlist Limit Reached"
                : "Basic Plan Limit"}
            </h4>
            <p className="banner-text">
              {hasReachedWatchlistLimit()
                ? "You've reached the limit of 5 movies in your watchlist."
                : `Basic users can add up to 5 movies to watchlist (${watchlist.length}/5 used)`}
            </p>
          </div>
          {hasReachedWatchlistLimit() && (
            <button className="upgrade-button" onClick={handleUpgradeAccount}>
              <FaCrown size={14} /> Upgrade to Premium
            </button>
          )}
        </motion.div>
      )}

      {isLoading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Loading your watchlist...</p>
        </div>
      )}

      {error && (
        <div className="error-container">
          <div className="error-message">{error}</div>
        </div>
      )}

      {!isLoading && !error && watchlist.length === 0 && (
        <motion.div
          className="empty-watchlist"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="empty-watchlist-icon">🎬</div>
          <h3>Your watchlist is empty</h3>
          <p>Find some great movies and add them to your watchlist</p>
          <Link to="/" className="btn-primary mt-4">
            Discover Movies
          </Link>
        </motion.div>
      )}

      {!isLoading && !error && watchlist.length > 0 && (
        <motion.div
          className="watchlist-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {watchlist.map((item, index) => (
            <motion.div
              key={item.id}
              className="watchlist-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.3 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="card-image-container">
                <img
                  src={item.Movie.posterfilm}
                  alt={item.Movie.title}
                  className="card-image"
                />
                <div className="card-overlay">
                  <div className="card-actions">
                    <Link
                      to={`/movies/${item.Movie.id}`}
                      className="card-action-button view"
                    >
                      <FaEye size={16} /> View
                    </Link>
                    <button
                      className="card-action-button remove"
                      onClick={() => handleRemoveFromWatchlist(item.id)}
                    >
                      <FaTrash size={16} /> Remove
                    </button>
                  </div>
                </div>
              </div>

              <div className="card-content">
                <h3 className="card-title">{item.Movie.title}</h3>

                <div className="card-meta">
                  <div className="meta-item">
                    <FaCalendarAlt size={14} />
                    <span>{formatDate(item.Movie.release_date)}</span>
                  </div>
                  {item.Movie.vote_average && (
                    <div className="meta-item rating">
                      <FaStar size={14} />
                      <span>{item.Movie.vote_average.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                <p className="card-description">
                  {item.Movie.description
                    ? `${item.Movie.description.substring(0, 100)}...`
                    : "No description available"}
                </p>

                <div className="card-footer">
                  <span className="added-date">
                    Added {formatDate(item.createdAt)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <style jsx>{`
        .watchlist-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
        }

        .text-gradient {
          background: linear-gradient(135deg, #fff 0%, #d1d1e0 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .watchlist-subtitle {
          color: var(--color-text-secondary);
          font-size: 1.1rem;
          margin-bottom: 0;
        }

        .btn-danger-outline {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          background-color: rgba(239, 68, 68, 0.1);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-danger-outline:hover {
          background-color: rgba(239, 68, 68, 0.2);
          transform: translateY(-2px);
        }

        .status-banner {
          display: flex;
          align-items: center;
          padding: 16px 20px;
          border-radius: 12px;
          margin-bottom: 30px;
          gap: 16px;
        }

        .status-banner.info {
          background: rgba(14, 165, 233, 0.1);
          border: 1px solid rgba(14, 165, 233, 0.3);
        }

        .status-banner.warning {
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .banner-icon {
          font-size: 24px;
        }

        .banner-content {
          flex: 1;
        }

        .banner-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .banner-text {
          margin: 0;
          color: var(--color-text-secondary);
          font-size: 0.95rem;
        }

        .upgrade-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .upgrade-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
        }

        .empty-watchlist {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          background-color: rgba(255, 255, 255, 0.03);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          text-align: center;
        }

        .empty-watchlist-icon {
          font-size: 4rem;
          margin-bottom: 20px;
        }

        .empty-watchlist h3 {
          font-size: 1.5rem;
          margin-bottom: 10px;
        }

        .empty-watchlist p {
          color: var(--color-text-secondary);
          margin-bottom: 25px;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: var(--gradient-primary);
          color: white;
          border-radius: 8px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s ease;
          border: none;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .watchlist-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 25px;
        }

        .watchlist-card {
          background-color: var(--color-surface);
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.03);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .watchlist-card:hover {
          box-shadow: var(--shadow-lg);
        }

        .card-image-container {
          position: relative;
          height: 200px;
          overflow: hidden;
        }

        .card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .watchlist-card:hover .card-image {
          transform: scale(1.05);
        }

        .card-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .watchlist-card:hover .card-overlay {
          opacity: 1;
        }

        .card-actions {
          display: flex;
          gap: 10px;
        }

        .card-action-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 500;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
        }

        .card-action-button.view {
          background-color: rgba(99, 102, 241, 0.9);
          color: white;
        }

        .card-action-button.view:hover {
          background-color: var(--color-primary);
          transform: translateY(-2px);
        }

        .card-action-button.remove {
          background-color: rgba(239, 68, 68, 0.9);
          color: white;
          border: none;
        }

        .card-action-button.remove:hover {
          background-color: var(--color-danger);
          transform: translateY(-2px);
        }

        .card-content {
          padding: 16px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .card-title {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 10px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .card-meta {
          display: flex;
          gap: 16px;
          margin-bottom: 12px;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--color-text-secondary);
          font-size: 0.9rem;
        }

        .meta-item.rating {
          color: var(--color-warning);
        }

        .card-description {
          color: var(--color-text-secondary);
          font-size: 0.9rem;
          line-height: 1.5;
          margin-bottom: 16px;
          flex: 1;
        }

        .card-footer {
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 0.8rem;
          color: var(--color-text-secondary);
        }

        .mt-4 {
          margin-top: 20px;
        }

        @media (max-width: 768px) {
          .watchlist-header {
            flex-direction: column;
            gap: 16px;
          }

          .status-banner {
            flex-direction: column;
            align-items: flex-start;
            text-align: center;
          }

          .upgrade-button {
            width: 100%;
            justify-content: center;
            margin-top: 10px;
          }
        }
      `}</style>
    </motion.div>
  );
}
