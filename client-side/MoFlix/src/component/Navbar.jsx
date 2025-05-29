import { Link, NavLink } from "react-router";
import logo from "../assets/logo.png";

export default function Navbar(props) {
  const { userId } = props;

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container-fluid">
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarTogglerDemo03"
            aria-controls="navbarTogglerDemo03"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <Link to={"/"}>
            <img src={logo} alt="Molfix-logo" style={{ height: "25px" }} />
          </Link>
          <div className="collapse navbar-collapse" id="navbarTogglerDemo03">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <NavLink className="nav-link active" aria-current="page" to="/">
                  Home
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to={`/watchlists/${userId}`}>
                  Watchlist
                </NavLink>
              </li>
            </ul>
            <NavLink to={`/movies/recommendations`} className="btn btn-outline-primary ms-3">
            AI
            </NavLink>
            <NavLink to={`/users/${userId}`} className="btn btn-outline-primary ms-3">
            Profile
            </NavLink>
          </div>
        </div>
      </nav>
    </>
  );
}
