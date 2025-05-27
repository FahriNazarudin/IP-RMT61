import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import http from "../lib/http";

export default function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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

        console.log(response.data);
        setMovie(response.data);
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

  return (
    <div className="container py-4">
      <button
        className="btn btn-outline-secondary mb-4"
        onClick={() => navigate(-1)}
      >
        &larr; Back
      </button>

      {isLoading && (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!isLoading && !error && movie && (
        <>

          <div className="row mb-5">
            <div className="col-md-4 mb-4">
              <img
                src={movie.posterfilm}
                alt={movie.title}
                className="img-fluid rounded shadow"
                style={{ width: "100%", objectFit: "cover" }}
              />
            </div>
            <div className="col-md-8">
              <h1 className="mb-2">{movie.title}</h1>


              <p className="text-muted mb-3">
                Released: {formatDate(movie.release_date)}
              </p>


              <div className="mb-4">
                {movie.genres &&
                  movie.genres.map((genre, index) => (
                    <span key={index} className="badge bg-secondary me-2 mb-2">
                      {genre}
                    </span>
                  ))}
              </div>


              <div className="d-flex align-items-center mb-4">
                <div className="me-3">
                  <span className="display-6 fw-bold text-warning">
                    {movie.vote_average?.toFixed(1)}
                  </span>
                  <small className="text-muted">/10</small>
                </div>
                <div>
                  <div
                    className="progress"
                    style={{ height: "8px", width: "150px" }}
                  >
                    <div
                      className="progress-bar bg-warning"
                      role="progressbar"
                      style={{ width: `${(movie.vote_average / 10) * 100}%` }}
                      aria-valuenow={movie.vote_average * 10}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    ></div>
                  </div>
                  <small className="text-muted">
                    {movie.voteCount?.toLocaleString()} votes
                  </small>
                </div>
              </div>


              <div className="row mb-4">
                <div className="col-6 col-md-4">
                  <small className="text-muted d-block">Language</small>
                  <p>{movie.language?.toUpperCase() || "N/A"}</p>
                </div>
                <div className="col-6 col-md-4">
                  <small className="text-muted d-block">Popularity</small>
                  <p>{movie.popularity?.toFixed(1) || "N/A"}</p>
                </div>
              </div>


              {movie.trailer && (
                <a
                  href={movie.trailer}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-danger me-2"
                >
                  <i className="bi bi-youtube me-2"></i>
                  Watch Trailer
                </a>
              )}

              <button className="btn btn-outline-primary">
                <i className="bi bi-bookmark me-2"></i>
                Add to Watchlist
              </button>
            </div>
          </div>



          <div className="row mb-5">
            <div className="col-12">
              <h3 className="mb-3">Synopsis</h3>
              <p className="lead">{movie.description}</p>
            </div>
          </div>


          {movie.trailer && (
            <div className="row mb-5">
              <div className="col-12">
                <h3 className="mb-3">Trailer</h3>
                {renderYouTubeEmbed(movie.trailer)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
