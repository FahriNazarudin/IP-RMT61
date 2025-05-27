import { useNavigate } from "react-router";

export default function CardMovie(props) {
  const { movie } = props;
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
    <div className="col-md-4 col-lg-3 mb-4">
      <div
        className="card h-100 shadow-sm"
        onClick={handleCardClick}
        style={{ cursor: "pointer", transition: "transform 0.3s" }}
        onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
        onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <img
          src={movie.posterfilm}
          className="card-img-top"
          alt={movie.title}
          style={{ height: "300px", objectFit: "cover" }}
        />
        <div className="card-body">
          <h5 className="card-title">{movie.title}</h5>
          <p className="card-text">
            <small className="text-muted">
              {formatDate(movie.release_date)}
            </small>
          </p>
        </div>
      </div>
    </div>
  );
}
