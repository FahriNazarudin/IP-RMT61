import { Link, NavLink } from "react-router";
import logo from "../assets/logo.png";
import { useState, useEffect } from "react";
import http from "../lib/http";

export default function Navbar(props) {
  const { userId } = props;
  const [userStatus, setUserStatus] = useState("basic");

  useEffect(() => {
    // Get user status from localStorage
    const status = localStorage.getItem("user_status") || "basic";
    setUserStatus(status);
  }, []);

  const handleUpgradeAccount = async () => {
    // Trigger snap popup. @TODO: Replace TRANSACTION_TOKEN_HERE with your transaction token
    const { data } = await http({
      method: "GET",
      url: "/payment/midtrans/initiate",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    window.snap.pay(data.transactionToken, {
      onSuccess: async function (result) {
        /* You may add your own implementation here */
        alert("payment success!");
        console.log(result);
        await http({
          method: "PATCH",
          url: `/users/me/upgrade`,
          data: {
            orderId: data.orderId,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
      },
    });
  };

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

            {/* User status badge */}
            <div className="me-2">
              <span
                className={`badge ${
                  userStatus === "premium"
                    ? "bg-warning text-dark"
                    : "bg-secondary"
                }`}
              >
                {userStatus === "premium" ? "Premium User" : "Basic User"}
              </span>
            </div>

            {userStatus === "basic" && (
              <button
                onClick={handleUpgradeAccount}
                className="btn btn-warning btn-sm me-2"
              >
                Upgrade to Premium
              </button>
            )}

            <NavLink
              to={`/movies/recommendations`}
              className="btn btn-outline-primary ms-3"
            >
              AI
            </NavLink>
            <NavLink
              to={`/users/${userId}`}
              className="btn btn-outline-primary ms-3"
            >
              Profile
            </NavLink>
          </div>
        </div>
      </nav>
    </>
  );
}
