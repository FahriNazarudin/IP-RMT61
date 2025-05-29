import { Link } from "react-router";
import logo from "../assets/logo.png";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import http from "../lib/http";

export default function NavbarUser(props) {
  const { userId } = props;
  const [userStatus, setUserStatus] = useState("basic");

  useEffect(() => {
    // Get user status from localStorage
    const status = localStorage.getItem("user_status") || "basic";
    setUserStatus(status);
  }, []);

  // Handle upgrade to premium
  const handleUpgradeAccount = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const { data } = await http({
        method: "GET",
        url: "/payment/midtrans/initiate",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      window.snap.pay(data.transactionToken, {
        onSuccess: async function (result) {
          /* You may add your own implementation here */
          try {
            await http({
              method: "PATCH",
              url: `/users/me/upgrade`,
              data: {
                orderId: data.orderId,
              },
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            // Update local storage and state
            localStorage.setItem("user_status", "premium");
            setUserStatus("premium");

            Swal.fire({
              icon: "success",
              title: "Upgrade Successful!",
              text: "You're now a premium user with unlimited watchlist capacity!",
              confirmButtonText: "Awesome!",
            }).then(() => {
              // Force refresh to update UI across the app
              window.location.reload();
            });
          } catch (error) {
            console.error("Error updating user status:", error);
            Swal.fire({
              icon: "error",
              title: "Status Update Failed",
              text: "Payment was successful but we couldn't update your status. Please contact support.",
            });
          }
        },
        onPending: function (result) {
          console.log("pending");
          console.log(result);
        },
        onError: function (result) {
          console.log("error");
          console.log(result);
          Swal.fire({
            icon: "error",
            title: "Payment Failed",
            text: "There was an issue processing your payment. Please try again.",
          });
        },
        onClose: function () {
          console.log(
            "customer closed the popup without finishing the payment"
          );
          Swal.fire({
            icon: "info",
            title: "Payment Canceled",
            text: "You closed the payment window. You can try upgrading again anytime.",
          });
        },
      });
    } catch (error) {
      console.error("Error initiating payment:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to initiate payment. Please try again.",
      });
    }
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

          {/* Add user status badge */}
          <div className="ms-auto me-3">
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
              className="btn btn-warning btn-sm"
              onClick={handleUpgradeAccount}
            >
              Upgrade to Premium
            </button>
          )}
        </div>
      </nav>
    </>
  );
}
