import { useNavigate } from "react-router";
import { FaStar } from "react-icons/fa";
import { motion } from "framer-motion";

export default function CardMovie(props) {
  const { movie } = props; // Change from data to movie
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
  };

  const handleCardClick = () => {
    navigate(`/movies/${movie.id}`);
  };

  return (
    <motion.div
      className="movie-card"
      whileHover={{
        y: -8,
        scale: 1.03,
        boxShadow: "0 8px 32px rgba(99,102,241,0.15)",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={handleCardClick}
      tabIndex={0}
      style={{ cursor: "pointer" }}
    >
      <div className="movie-card-image-container">
        <img
          src={movie.posterfilm}
          className="movie-card-img"
          alt={movie.title}
        />
        <div className="movie-card-overlay">
          <span className="movie-card-overlay-title">{movie.title}</span>
        </div>
      </div>
      <div className="movie-card-body">
        <div className="movie-card-title">{movie.title}</div>
        <div className="movie-card-meta">
          <span className="movie-card-date">
            {formatDate(movie.release_date)}
          </span>
          {movie.vote_average && (
            <span className="movie-card-rating">
              <FaStar style={{ color: "#fbbf24", marginRight: 4 }} />
              {movie.vote_average.toFixed(1)}
            </span>
          )}
        </div>
      </div>
      <style jsx>{`
        .movie-card {
          background: rgba(20, 23, 43, 0.7);
          border-radius: 18px;
          box-shadow: 0 2px 12px rgba(99, 102, 241, 0.07);
          border: 1px solid rgba(255, 255, 255, 0.04);
          overflow: hidden;
          transition: box-shadow 0.2s, transform 0.2s;
          display: flex;
          flex-direction: column;
          height: 100%;
          min-width: 200px;
        }
        .movie-card-image-container {
          position: relative;
          width: 100%;
          height: 320px;
          overflow: hidden;
        }
        .movie-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-top-left-radius: 18px;
          border-top-right-radius: 18px;
          transition: transform 0.3s;
        }
        .movie-card:hover .movie-card-img {
          transform: scale(1.05);
        }
        .movie-card-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(
            0deg,
            rgba(20, 23, 43, 0.85) 60%,
            rgba(20, 23, 43, 0.05) 100%
          );
          color: #fff;
          padding: 18px 14px 10px 14px;
          opacity: 0;
          transition: opacity 0.2s;
          pointer-events: none;
        }
        .movie-card:hover .movie-card-overlay,
        .movie-card:focus .movie-card-overlay {
          opacity: 1;
        }
        .movie-card-overlay-title {
          font-size: 1.1rem;
          font-weight: 600;
          letter-spacing: 0.01em;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
        }
        .movie-card-body {
          padding: 18px 14px 14px 14px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .movie-card-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #fff;
          margin-bottom: 8px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .movie-card-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.95rem;
          color: var(--color-text-secondary, #b3b3c6);
        }
        .movie-card-date {
          font-size: 0.95rem;
        }
        .movie-card-rating {
          display: flex;
          align-items: center;
          font-weight: 500;
          color: #fbbf24;
          font-size: 0.97rem;
        }
        @media (max-width: 600px) {
          .movie-card-image-container {
            height: 220px;
          }
        }
      `}</style>
    </motion.div>
  );
}
