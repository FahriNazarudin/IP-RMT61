import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import http from "../lib/http";
import Swal from "sweetalert2";
import { FaStar, FaHome, FaRocket } from "react-icons/fa";
import { motion } from "framer-motion";

export default function NavbarUser(props) {
  const { userId } = props;
  const [userStatus, setUserStatus] = useState("basic");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Get user status from localStorage
    const status = localStorage.getItem("user_status") || "basic";
    setUserStatus(status);

    // Add scroll event listener
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`navbar ${isScrolled ? "navbar-scrolled" : ""}`}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "16px 24px",
        transition: "all 0.3s ease",
        background: isScrolled ? "rgba(10, 12, 19, 0.85)" : "transparent",
        backdropFilter: isScrolled ? "blur(10px)" : "none",
        borderBottom: isScrolled
          ? "1px solid rgba(255, 255, 255, 0.05)"
          : "none",
      }}
    >
      <div className="navbar-container">
        <Link to={"/"} className="navbar-logo">
          <span className="logo-text">MoFlix</span>
        </Link>

        <div className="navbar-actions">
          {/* User status badge */}
          <div
            className={`status-badge ${
              userStatus === "premium" ? "premium" : "basic"
            }`}
          >
            {userStatus === "premium" ? (
              <>
                <FaStar size={14} /> Premium
              </>
            ) : (
              <>Basic</>
            )}
          </div>

          {userStatus === "basic" && (
            <button className="upgrade-button" onClick={handleUpgradeAccount}>
              <FaRocket size={14} />
              <span>Upgrade</span>
            </button>
          )}

          <Link to={"/"} className="home-button">
            <FaHome size={16} />
            <span>Home</span>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          padding: 16px 24px;
          transition: all 0.3s ease;
          background: ${isScrolled ? "rgba(10, 12, 19, 0.85)" : "transparent"};
          backdrop-filter: ${isScrolled ? "blur(10px)" : "none"};
          border-bottom: ${isScrolled
            ? "1px solid rgba(255, 255, 255, 0.05)"
            : "none"};
        }

        .navbar-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1200px;
          margin: 0 auto;
        }

        .navbar-logo {
          font-weight: 700;
          font-size: 1.5rem;
          display: flex;
          align-items: center;
          gap: 8px;
          color: white;
        }

        .logo-text {
          background: linear-gradient(135deg, #4f46e5 0%, #6d28d9 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .status-badge.basic {
          background: rgba(255, 255, 255, 0.1);
          color: #9b9db8;
        }

        .status-badge.premium {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .upgrade-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 20px;
          background: linear-gradient(135deg, #4f46e5 0%, #6d28d9 100%);
          color: white;
          font-weight: 500;
          font-size: 0.9rem;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .upgrade-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
        }

        .home-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-weight: 500;
          font-size: 0.9rem;
          border: none;
          transition: all 0.2s ease;
        }

        .home-button:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        @media (max-width: 768px) {
          .home-button span,
          .upgrade-button span {
            display: none;
          }

          .home-button,
          .upgrade-button {
            padding: 8px;
          }

          .status-badge {
            padding: 6px 8px;
            font-size: 0.8rem;
          }
        }
      `}</style>
    </motion.nav>
  );
}
