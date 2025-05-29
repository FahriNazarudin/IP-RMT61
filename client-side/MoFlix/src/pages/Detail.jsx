import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import http from "../lib/http";
import Swal from "sweetalert2";
import { FaPlay, FaPlus, FaCheck, FaStar } from "react-icons/fa";
import { motion } from "framer-motion";
import "./Detail.css";

export default function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [watchlistId, setWatchlistId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userWatchlistCount, setUserWatchlistCount] = useState(0);
  const [userStatus, setUserStatus] = useState("basic");

  useEffect(() => {
    // Get user status from localStorage
    const status = localStorage.getItem("user_status") || "basic";
    setUserStatus(status);

    async function fetchMovieDetail() {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await http({
          method: "GET",
          url: `/movies/${id}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setMovie(response.data);

        // Check if the movie is in the user's watchlist
        checkWatchlistStatus(response.data.id, token);
      } catch (error) {
        console.error("Error fetching movie detail:", error);
        setError(
          error.response?.data?.message ||
            "Failed to load movie details. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchMovieDetail();
  }, [id, navigate]);

  // Check if movie is in watchlist
  const checkWatchlistStatus = async (movieId, token) => {
    try {
      const response = await http({
        method: "GET",
        url: "/watchlists",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Set total watchlist count
      setUserWatchlistCount(response.data.length);

      // Find if this movie exists in the watchlist
      const watchlistItem = response.data.find(
        (item) => item.MovieId === movieId || item.Movie?.id === movieId
      );

      if (watchlistItem) {
        setIsInWatchlist(true);
        setWatchlistId(watchlistItem.id);
      } else {
        setIsInWatchlist(false);
        setWatchlistId(null);
      }
    } catch (error) {
      console.error("Error checking watchlist status:", error);
    }
  };

  // Check if the user has reached their watchlist limit
  const hasReachedWatchlistLimit = () => {
    return userStatus === "basic" && userWatchlistCount >= 5;
  };

  // Toggle movie in watchlist
  const toggleWatchlist = async () => {
    setIsProcessing(true);
    const token = localStorage.getItem("access_token");

    try {
      if (isInWatchlist) {
        // Remove from watchlist
        await http({
          method: "DELETE",
          url: `/watchlists/${watchlistId}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setIsInWatchlist(false);
        setWatchlistId(null);
        setUserWatchlistCount((prev) => prev - 1);

        Swal.fire({
          icon: "success",
          title: "Removed!",
          text: "Movie removed from your watchlist",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        // Check if user has reached limit
        if (hasReachedWatchlistLimit()) {
          Swal.fire({
            icon: "warning",
            title: "Watchlist Limit Reached",
            text: "Basic users can only add 5 movies to their watchlist. Upgrade to premium for unlimited watchlist items!",
            showCancelButton: true,
            confirmButtonText: "Upgrade to Premium",
            cancelButtonText: "Maybe Later",
          }).then(async (result) => {
            if (result.isConfirmed) {
              try {
                // Use the payment system to upgrade
                const { data } = await http({
                  method: "GET",
                  url: "/payment/midtrans/initiate",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                });

                window.snap.pay(data.transactionToken, {
                  onSuccess: async function () {
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
                      text: "You can now add unlimited movies to your watchlist.",
                      confirmButtonText: "Add Movie Now",
                    }).then(() => {
                      // Re-attempt to add the movie to watchlist
                      toggleWatchlist();
                    });
                  },
                  onPending: function (result) {
                    console.log("pending");
                    console.log(result);
                  },
                  onError: function (result) {
                    console.log("error");
                    console.log(result);
                    Swal.fire({
                      icon: "error",
                      title: "Payment Failed",
                      text: "There was an issue processing your payment. Please try again.",
                    });
                  },
                  onClose: function () {
                    console.log(
                      "customer closed the popup without finishing the payment"
                    );
                    Swal.fire({
                      icon: "info",
                      title: "Payment Canceled",
                      text: "You closed the payment window. You can try upgrading again anytime.",
                    });
                  },
                });
              } catch (error) {
                console.error("Payment initiation error:", error);
                Swal.fire({
                  icon: "error",
                  title: "Error",
                  text: "Failed to initiate payment. Please try again.",
                });
              }
            }
          });
          setIsProcessing(false);
          return;
        }

        // Add to watchlist if limit not reached
        const response = await http({
          method: "POST",
          url: "/watchlists",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          data: {
            MovieId: movie.id,
            movieId: movie.id,
          },
        });

        setIsInWatchlist(true);
        setWatchlistId(response.data.id);
        setUserWatchlistCount((prev) => prev + 1);

        Swal.fire({
          icon: "success",
          title: "Added!",
          text: "Movie added to your watchlist",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Error toggling watchlist:", error);
      console.log("Request payload:", { MovieId: movie.id, movieId: movie.id });
      console.log("Movie object:", movie);

      Swal.fire({
        icon: "error",
        title: "Oops...",
        text:
          error.response?.data?.message ||
          "Something went wrong. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No date";

    const date = new Date(dateString);
    return `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
  };

  const renderYouTubeEmbed = (url) => {
    if (!url) return null;

    const videoIdMatch = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^?&]+)/
    );
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    if (!videoId) return null;

    return (
      <div className="ratio ratio-16x9 mt-3">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    );
  };

  const formatReleaseYear = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).getFullYear();
  };

  const renderGenres = (genresString) => {
    if (!genresString) return null;
    const genres = genresString.split(",");
    return (
      <div className="genres-container">
        {genres.map((genre, index) => (
          <span key={index} className="genre-badge">
            {genre.trim()}
          </span>
        ))}
      </div>
    );
  };

  const renderRating = (rating) => {
    if (!rating) return "N/A";
    const stars = [];
    const fullStars = Math.floor(rating / 2);
    const hasHalfStar = rating % 2 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} className="star filled" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<FaStar key={i} className="star half-filled" />);
      } else {
        stars.push(<FaStar key={i} className="star empty" />);
      }
    }

    return (
      <div className="rating-container">
        <div className="stars">{stars}</div>
        <span className="rating-value">{rating.toFixed(1)}/10</span>
      </div>
    );
  };

  return (
    <>
      {isLoading && (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      )}

      {error && (
        <div className="error-container">
          <div className="error-message">{error}</div>
        </div>
      )}

      {!isLoading && !error && movie && (
        <div className="movie-detail-container">
          {/* Hero Section */}
          <div
            className="hero-section"
            style={{
              backgroundImage: `url(${
                movie.posterfilm || movie.backdrop_path
              })`,
            }}
          >
            <div className="hero-overlay">
              <div className="container">
                <motion.div
                  className="movie-header"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="movie-poster-container">
                    <img
                      src={movie.posterfilm || movie.poster_path}
                      alt={movie.title}
                      className="movie-poster"
                    />
                    <div className="poster-overlay">
                      {movie.trailer && (
                        <motion.button
                          className="play-trailer-btn"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => window.open(movie.trailer, "_blank")}
                        >
                          <FaPlay />
                        </motion.button>
                      )}
                    </div>
                  </div>

                  <div className="movie-info">
                    <h1 className="movie-title">{movie.title}</h1>
                    <div className="movie-meta">
                      <span className="release-year">
                        {formatReleaseYear(movie.release_date)}
                      </span>
                      <span className="language">
                        {movie.language?.toUpperCase() || "N/A"}
                      </span>
                      <span className="popularity">
                        Popularity: {movie.popularity?.toFixed(1) || "N/A"}
                      </span>
                    </div>

                    {renderGenres(movie.genre)}
                    {renderRating(movie.vote_average)}

                    <div className="movie-actions">
                      {movie.trailer && (
                        <motion.a
                          href={movie.trailer}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="action-button trailer-button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FaPlay /> Watch Trailer
                        </motion.a>
                      )}

                      <motion.button
                        className={`action-button watchlist-button ${
                          isInWatchlist ? "in-watchlist" : ""
                        }`}
                        onClick={toggleWatchlist}
                        disabled={
                          isProcessing ||
                          (!isInWatchlist && hasReachedWatchlistLimit())
                        }
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {isInWatchlist ? (
                          <>
                            <FaCheck /> In Watchlist
                          </>
                        ) : (
                          <>
                            <FaPlus /> Add to Watchlist
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="content-container container">
            <motion.div
              className="content-section"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="section synopsis-section">
                <h2 className="section-title">Synopsis</h2>
                <p className="synopsis-text">
                  {movie.description || "No synopsis available."}
                </p>
              </div>

              {movie.trailer && (
                <div className="section trailer-section">
                  <h2 className="section-title">Trailer</h2>
                  {renderYouTubeEmbed(movie.trailer)}
                </div>
              )}

              {userStatus === "basic" &&
                !isInWatchlist &&
                hasReachedWatchlistLimit() && (
                  <motion.div
                    className="upgrade-notice"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    <h3>Watchlist Limit Reached</h3>
                    <p>
                      Basic users can only add 5 movies to their watchlist.
                      Upgrade to premium for unlimited watchlist items!
                    </p>
                    <button
                      className="upgrade-button"
                      onClick={toggleWatchlist}
                    >
                      Upgrade to Premium
                    </button>
                  </motion.div>
                )}
            </motion.div>
          </div>
        </div>
      )}
    </>
  );
}
