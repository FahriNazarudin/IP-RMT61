import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router";
import http from "../lib/http";
import Swal from "sweetalert2";

export default function Watchlist() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await http({
        method: "GET",
        url: "/watchlists",
        headers: {
          Authorization: `Bearer ${token}`,
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

  const handleRemoveFromWatchlist = async (watchlistId) => {
    Swal.fire({
      title: "Remove from watchlist?",
      text: "This movie will be removed from your watchlist",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, remove it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem("access_token");

        try {
          await http({
            method: "DELETE",
            url: `/watchlists/${watchlistId}`,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });


          setWatchlist((prevWatchlist) =>
            prevWatchlist.filter((item) => item.id !== watchlistId)
          );

          Swal.fire({
            icon: "success",
            title: "Removed!",
            text: "Movie removed from your watchlist",
            timer: 1500,
            showConfirmButton: false,
          });
        } catch (error) {
          console.error("Error removing from watchlist:", error);
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Something went wrong! Please try again.",
          });
        }
      }
    });
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
      <h1 className="mb-4">My Watchlist</h1>

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
