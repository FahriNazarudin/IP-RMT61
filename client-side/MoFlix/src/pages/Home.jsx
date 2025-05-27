import { useEffect, useState } from "react";
import CardMovie from "../component/CardMovie";
import http from "../lib/http";
import { useNavigate } from "react-router";

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function fetchMovies() {
    setIsLoading(true);
    setError(null);

    const token = localStorage.getItem("access_token"); // Fixed typo

    if (!token) {
      navigate("/login"); // Redirect if no token
      return;
    }

    try {
      const response = await http({
        method: "GET",
        url: "/movies",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(response.data, "movies");
      setMovies(response.data);
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
  }, []);

  return (
    <div className="container py-4">
      <h1 className="mb-3">Welcome to MoFlix</h1>
      <p className="lead mb-4">
        Your favorite movies and shows, all in one place.
      </p>
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
    </div>
  );
}
