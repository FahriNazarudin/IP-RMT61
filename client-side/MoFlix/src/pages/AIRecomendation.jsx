import { useState, useEffect } from "react";
import http from "../lib/http";
import { useNavigate } from "react-router";
import CardMovie from "../component/CardMovie";
import { motion } from "framer-motion";
import { FaSearch, FaArrowLeft, FaInfoCircle } from "react-icons/fa";
import "../styles/AIRecommendation.css";

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
    document.body.style.background = "#0a0c13";
    document.body.style.color = "#f1f1f8";
    return () => {
      document.body.style.background = "";
      document.body.style.color = "";
    };
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
    <motion.div
      className="ai-recommendation-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="ai-header">
        <motion.button
          className="back-button"
          onClick={() => navigate(-1)}
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaArrowLeft /> Back
        </motion.button>
        <h2 className="ai-title">AI Movie Recommendations</h2>
      </div>

      <motion.div
        className="search-card"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <form onSubmit={handleSubmit} className="search-form">
          <div className="search-input-group">
            <input
              type="text"
              className="search-input"
              placeholder="Describe what kind of movie you're looking for..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <motion.button
              className="search-button"
              type="submit"
              disabled={isLoading || !input.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <>
                  <span className="spinner small"></span>
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <FaSearch /> Find Movies
                </>
              )}
            </motion.button>
          </div>
          <div className="search-hint">
            Try: "Show me sci-fi movies from the 90s" or "Find comedy movies
            about weddings"
          </div>
        </form>
      </motion.div>

      {isLoading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Finding the perfect movies for you...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="error-container">
          <div className="error-message">{error}</div>
        </div>
      )}

      {!isLoading && recommendedMovies.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="results-header">
            {searchTerm
              ? `Movie Recommendations for "${searchTerm}"`
              : "Popular Movies"}
          </h3>

          {searchTerm &&
            aiResponse.includes("5.") &&
            recommendedMovies.length < 5 && (
              <div className="warning-message">
                <FaInfoCircle />
                <span>
                  Some recommended movies couldn't be found in our database.
                  Showing {recommendedMovies.length} of 5 recommended movies.
                </span>
              </div>
            )}

          <div className="movies-grid">
            {recommendedMovies.map((movie, index) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index % 6), duration: 0.3 }}
              >
                <CardMovie movie={movie} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {!isLoading && searchTerm && recommendedMovies.length === 0 && !error && (
        <div className="no-results">
          <p>No movies found matching your criteria. Try a different search.</p>
        </div>
      )}
    </motion.div>
  );
}
