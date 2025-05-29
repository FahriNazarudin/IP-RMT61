import { useState, useEffect } from "react";
import http from "../lib/http";
import { useNavigate } from "react-router";
import CardMovie from "../component/CardMovie";

export default function AIRecomendation() {
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [input, setInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [aiResponse, setAiResponse] = useState("");
  const navigate = useNavigate();

  // Load some initial popular movies
  useEffect(() => {
    fetchPopularMovies();
  }, []);

  const fetchPopularMovies = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await http({
        method: "GET",
        url: "/movies",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          sort: "-popularity",
          limit: 12,
        },
      });

      setRecommendedMovies(response.data.movies || []);
    } catch (err) {
      console.error("Error fetching popular movies:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!input.trim()) return;

    const userQuery = input;
    setSearchTerm(userQuery);
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await http({
        method: "GET",
        url: "/movies/recommendations",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          question: userQuery,
        },
      });

      // Save AI's text response for context
      setAiResponse(response.data.recommendations || "");

      // Set movie recommendations if available
      if (response.data.movies && response.data.movies.length > 0) {
        setRecommendedMovies(response.data.movies);
      } else {
        setRecommendedMovies([]);
        setError(
          "No movies found matching your criteria. Try a different search."
        );
      }
    } catch (err) {
      console.error("Error getting recommendations:", err);
      setError("Sorry, I couldn't process your request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-4">
      {/* Header & Search */}
      <div className="row justify-content-center mb-4">
        <div className="col-lg-10">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate(-1)}
            >
              &larr; Back
            </button>
            <h2 className="m-0">AI Movie Recommendations</h2>
          </div>

          {/* Search Form */}
          <div className="card mb-4">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="Describe what kind of movie you're looking for..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={isLoading || !input.trim()}
                  >
                    {isLoading ? (
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
                    ) : (
                      <i className="bi bi-search me-2"></i>
                    )}
                    Find Movies
                  </button>
                </div>
                <div className="form-text text-muted mt-2">
                  Try: "Show me sci-fi movies from the 90s" or "Find comedy
                  movies about weddings"
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Finding the perfect movies for you...</p>
        </div>
      )}
      {/* Error Message */}
      {error && !isLoading && (
        <div
          className="alert alert-danger mx-auto"
          style={{ maxWidth: "800px" }}
        >
          {error}
        </div>
      )}

   

      {!isLoading && recommendedMovies.length > 0 && (
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <h3 className="mb-4 pb-2 border-bottom">
              {searchTerm
                ? `Movie Recommendations for "${searchTerm}"`
                : "Popular Movies"}
            </h3>

            {/* Tampilkan pesan jika ada rekomendasi yang hilang */}
            {searchTerm &&
              aiResponse.includes("5.") &&
              recommendedMovies.length < 5 && (
                <div className="alert alert-warning mb-4">
                  <i className="bi bi-info-circle me-2"></i>
                  Some recommended movies couldn't be found in our database.
                  Showing {recommendedMovies.length} of 5 recommended movies.
                </div>
              )}

            <div className="row">
              {recommendedMovies.map((movie) => (
                <div key={movie.id} className="col-md-4 col-lg-2.4 mb-4">
                  <CardMovie movie={movie} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* No Results */}
      {!isLoading && searchTerm && recommendedMovies.length === 0 && !error && (
        <div className="text-center py-5">
          <p className="text-muted">
            No movies found matching your criteria. Try a different search.
          </p>
        </div>
      )}
    </div>
  );
}
