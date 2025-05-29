import { useEffect, useState } from "react";
import CardMovie from "../component/CardMovie";
import http from "../lib/http";
import { useNavigate } from "react-router";

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [genre, setGenre] = useState("");
  const [sort, setSort] = useState("");
  const navigate = useNavigate();

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

  return (
    <div className="container py-4">
      <div className="row mb-4">
        <div className="col-md-4">
          <label htmlFor="genre" className="form-label">
            Filter by Genre
          </label>
          <select
            id="genre"
            className="form-select"
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
        <div className="col-md-4">
          <label htmlFor="sort" className="form-label">
            Sort by Release Date
          </label>
          <select
            id="sort"
            className="form-select"
            value={sort}
            onChange={handleSortChange}
          >
            <option value="">Default</option>
            <option value="release_date">Ascending</option>
            <option value="-release_date">Descending</option>
          </select>
        </div>
      </div>

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
      {!isLoading && !error && movies.length === 0 && (
        <div className="alert alert-info">
          No movies found. Check back later for updates!
        </div>
      )}
      {!isLoading && !error && movies.length > 0 && (
        <div className="row">
          {movies.map((movie) => (
            <CardMovie key={movie.id} movie={movie} />
          ))}
        </div>
      )}

      {!isLoading && !error && totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <nav>
            <ul className="pagination">
              <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(page - 1)}
                >
                  Previous
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, index) => (
                <li
                  key={index}
                  className={`page-item ${page === index + 1 ? "active" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </button>
                </li>
              ))}
              <li
                className={`page-item ${page === totalPages ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => handlePageChange(page + 1)}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}