import { Link, NavLink } from "react-router";
import logo from "../assets/logo.png";

export default function NavbarUser(props) {
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
        </div>
      </nav>
    </>
  );
}
