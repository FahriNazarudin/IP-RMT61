import { useEffect, useState } from "react";
import CardMovie from "../component/CardMovie";
import http from "../lib/http";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  FaFilter,
  FaSort,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [genre, setGenre] = useState("");
  const [sort, setSort] = useState("");
  const [userStatus, setUserStatus] = useState("basic");
  const navigate = useNavigate();

  useEffect(() => {
    // Get user status from localStorage
    const status = localStorage.getItem("user_status") || "basic";
    setUserStatus(status);

    // Fetch movies
    fetchMovies();
  }, [page, genre, sort]);

  async function fetchMovies() {
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
        url: `/movies?page=${page}&genre=${genre}&sort=${sort}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(response.data, "movies");
      setMovies(response.data.movies);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.log("Error fetching movies: ", error.message);
      setError(
        error.response?.data?.message ||
          "Failed to load movies. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchMovies();
  }, [page, genre, sort]);

  const handleGenreChange = (e) => {
    setGenre(e.target.value);
    setPage(1);
  };

  const handleSortChange = (e) => {
    setSort(e.target.value);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  useEffect(() => {
    document.body.style.background = "#0a0c13";
    document.body.style.color = "#f1f1f8";
    return () => {
      document.body.style.background = "";
      document.body.style.color = "";
    };
  }, []);

  return (
    <motion.div
      className="page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="section-header mb-6">
        <motion.h1
          className="text-gradient"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          Discover Movies
        </motion.h1>
        <motion.p
          className="text-secondary"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Explore our collection of the latest and greatest films
        </motion.p>
      </div>

      <motion.div
        className="filter-section card-glass mb-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="filter-container">
          <div className="filter-group">
            <label htmlFor="genre" className="filter-label">
              <FaFilter className="filter-icon" /> Genre
            </label>
            <select
              id="genre"
              className="select-control"
              value={genre}
              onChange={handleGenreChange}
            >
              <option value="">All Genres</option>
              <option value="Action">Action</option>
              <option value="Adventure">Adventure</option>
              <option value="Animation">Animation</option>
              <option value="Comedy">Comedy</option>
              <option value="Crime">Crime</option>
              <option value="Drama">Drama</option>
              <option value="Family">Family</option>
              <option value="Fantasy">Fantasy</option>
              <option value="History">History</option>
              <option value="Horror">Horror</option>
              <option value="Music">Music</option>
              <option value="Mystery">Mystery</option>
              <option value="Romance">Romance</option>
              <option value="Science Fiction">Science Fiction</option>
              <option value="Thriller">Thriller</option>
              <option value="War">War</option>
              <option value="Western">Western</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="sort" className="filter-label">
              <FaSort className="filter-icon" /> Sort By
            </label>
            <select
              id="sort"
              className="select-control"
              value={sort}
              onChange={handleSortChange}
            >
              <option value="">Default</option>
              <option value="release_date">Release Date (Oldest)</option>
              <option value="-release_date">Release Date (Newest)</option>
              <option value="-popularity">Popularity</option>
              <option value="-vote_average">Rating</option>
            </select>
          </div>
        </div>
      </motion.div>

      {isLoading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Loading movies...</p>
        </div>
      )}

      {error && (
        <div className="error-container">
          <div className="error-message">{error}</div>
        </div>
      )}

      {!isLoading && !error && movies.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🎬</div>
          <h3>No movies found</h3>
          <p>Try adjusting your filters or check back later for updates</p>
        </div>
      )}

      {!isLoading && !error && movies.length > 0 && (
        <motion.div
          className="movies-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, staggerChildren: 0.1 }}
        >
          {movies.map((movie, index) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.3 }}
            >
              <CardMovie movie={movie} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {!isLoading && !error && totalPages > 1 && (
        <div className="pagination-container">
          <button
            className={`pagination-button ${page === 1 ? "disabled" : ""}`}
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            <FaChevronLeft /> Previous
          </button>

          <div className="pagination-numbers">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                className={`pagination-number ${
                  page === index + 1 ? "active" : ""
                }`}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <button
            className={`pagination-button ${
              page === totalPages ? "disabled" : ""
            }`}
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
          >
            Next <FaChevronRight />
          </button>
        </div>
      )}

      <style jsx>{`
        .section-header {
          margin-bottom: 2rem;
        }

        .text-gradient {
          background: linear-gradient(135deg, #fff 0%, #d1d1e0 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .text-secondary {
          color: var(--color-text-secondary);
          font-size: 1.1rem;
        }

        .filter-section {
          padding: 20px;
          border-radius: 16px;
          margin-bottom: 30px;
        }

        .filter-container {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }

        .filter-group {
          flex: 1;
          min-width: 200px;
        }

        .filter-label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .filter-icon {
          color: var(--color-primary);
        }

        .select-control {
          width: 100%;
          background-color: var(--color-surface-2);
          color: var(--color-text);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 10px 15px;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23fff' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 15px center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .select-control:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
          outline: none;
        }

        .movies-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 25px;
          margin-bottom: 40px;
        }

        .pagination-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          margin-top: 40px;
          padding-bottom: 30px;
        }

        .pagination-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background-color: var(--color-surface-2);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: var(--color-text);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .pagination-button:hover:not(.disabled) {
          background-color: var(--color-surface-3);
          transform: translateY(-2px);
        }

        .pagination-button.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-numbers {
          display: flex;
          gap: 8px;
        }

        .pagination-number {
          width: 35px;
          height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background-color: var(--color-surface-2);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--color-text);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .pagination-number:hover:not(.active) {
          background-color: var(--color-surface-3);
        }

        .pagination-number.active {
          background-color: var(--color-primary);
          color: white;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background-color: rgba(255, 255, 255, 0.03);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 20px;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
        }

        .loading-text {
          margin-top: 20px;
          color: var(--color-text-secondary);
        }

        @media (max-width: 768px) {
          .filter-container {
            flex-direction: column;
          }

          .pagination-numbers {
            display: none;
          }
        }
      `}</style>
    </motion.div>
  );
}
