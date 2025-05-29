import { Link, NavLink } from "react-router";
import logo from "../assets/logow.png";
import { useState, useEffect } from "react";
import http from "../lib/http";
import { motion } from "framer-motion";
import { FaStar, FaCrown, FaRobot, FaUser, FaList, FaHome } from "react-icons/fa";
import Swal from "sweetalert2";

export default function Navbar(props) {
  const { userId } = props;
  const [userStatus, setUserStatus] = useState("basic");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Get user status from localStorage
    const status = localStorage.getItem("user_status") || "basic";
    setUserStatus(status);

    // Add scroll event listener
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleUpgradeAccount = async () => {
    try {
      const { data } = await http({
        method: "GET",
        url: "/payment/midtrans/initiate",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      window.snap.pay(data.transactionToken, {
        onSuccess: async function (result) {
          try {
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

            // Update local storage and state
            localStorage.setItem("user_status", "premium");
            setUserStatus("premium");

            Swal.fire({
              icon: "success",
              title: "Upgrade Successful!",
              text: "You now have access to all premium features",
              timer: 2000,
              showConfirmButton: false,
            });
          } catch (error) {
            console.error("Error updating status:", error);
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "Payment successful but status update failed. Please contact support.",
            });
          }
        },
        onPending: function (result) {
          console.log("Payment pending", result);
        },
        onError: function (result) {
          console.error("Payment error", result);
          Swal.fire({
            icon: "error",
            title: "Payment Failed",
            text: "There was an issue processing your payment.",
          });
        },
        onClose: function () {
          Swal.fire({
            icon: "info",
            title: "Payment Canceled",
            text: "You closed the payment window.",
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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="navbar-container"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        transition: "all 0.3s ease",
        background: isScrolled ? "rgba(10, 12, 19, 0.85)" : "rgba(10, 12, 19, 0.5)",
        backdropFilter: isScrolled ? "blur(12px)" : "blur(8px)",
        boxShadow: isScrolled ? "0 4px 20px rgba(0, 0, 0, 0.2)" : "none",
        borderBottom: isScrolled ? "1px solid rgba(255, 255, 255, 0.05)" : "none",
        padding: "12px 24px",
      }}
    >
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        maxWidth: "1200px",
        margin: "0 auto",
        width: "100%"
      }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Link
            to={"/"}
            style={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              marginRight: "24px"
            }}
          >
            <motion.img
              src={logo}
              alt="MoFlix-logo"
              style={{ height: "28px" }}
              whileHover={{ scale: 1.05 }}
            />
            <motion.span
              style={{
                background: "linear-gradient(135deg, #4f46e5 0%, #6d28d9 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: "700",
                fontSize: "1.2rem",
                marginLeft: "10px"
              }}
              whileHover={{ scale: 1.05 }}
            >
              MoFlix
            </motion.span>
          </Link>

          <div className="nav-links-desktop" style={{
            display: "flex",
            gap: "20px"
          }}>
            <NavLinkStyled to="/" icon={<FaHome />} label="Home" />
            <NavLinkStyled to={`/watchlists/${userId}`} icon={<FaList />} label="Watchlist" />
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          className="menu-toggle"
          onClick={toggleMenu}
          style={{
            display: "none",
            background: "none",
            border: "none",
            color: "white",
            fontSize: "1.5rem",
            cursor: "pointer",
            padding: "4px 8px",
            borderRadius: "4px",
            "@media (max-width: 768px)": {
              display: "block"
            }
          }}
        >
          <span className="menu-icon">{isMenuOpen ? "✕" : "☰"}</span>
        </button>

        {/* Right side items */}
        <div className="nav-right" style={{
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}>
          {/* User status badge */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 12px",
            borderRadius: "20px",
            fontSize: "0.85rem",
            fontWeight: "500",
            background: userStatus === "premium"
              ? "rgba(245, 158, 11, 0.15)"
              : "rgba(255, 255, 255, 0.1)",
            color: userStatus === "premium" ? "#f59e0b" : "#9b9db8",
            border: userStatus === "premium"
              ? "1px solid rgba(245, 158, 11, 0.3)"
              : "1px solid rgba(255, 255, 255, 0.05)"
          }}>
            {userStatus === "premium" ? (
              <>
                <FaCrown size={14} /> Premium
              </>
            ) : (
              <>
                <FaStar size={14} /> Basic
              </>
            )}
          </div>

          {userStatus === "basic" && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleUpgradeAccount}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                borderRadius: "20px",
                background: "linear-gradient(135deg, #4f46e5 0%, #6d28d9 100%)",
                color: "white",
                fontWeight: "500",
                border: "none",
                cursor: "pointer",
                fontSize: "0.85rem",
                boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
              }}
            >
              <FaCrown size={14} /> Upgrade
            </motion.button>
          )}

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <NavLink
              to={`/movies/recommendations`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "20px",
                background: "rgba(14, 165, 233, 0.15)",
                color: "#0ea5e9",
                border: "1px solid rgba(14, 165, 233, 0.3)",
                fontWeight: "500",
                fontSize: "0.85rem",
                textDecoration: "none",
                transition: "all 0.2s ease"
              }}
            >
              <FaRobot size={14} /> AI
            </NavLink>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <NavLink
              to={`/users/${userId}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "20px",
                background: "rgba(255, 255, 255, 0.1)",
                color: "white",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                fontWeight: "500",
                fontSize: "0.85rem",
                textDecoration: "none",
                transition: "all 0.2s ease"
              }}
            >
              <FaUser size={14} /> Profile
            </NavLink>
          </motion.div>
        </div>
      </div>

      {/* Mobile nav menu */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: isMenuOpen ? "auto" : 0,
          opacity: isMenuOpen ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
        style={{
          overflow: "hidden",
          marginTop: isMenuOpen ? "16px" : 0
        }}
        className="mobile-menu"
      >
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          padding: "12px 8px"
        }}>
          <MobileNavLink to="/" icon={<FaHome />} label="Home" />
          <MobileNavLink to={`/watchlists/${userId}`} icon={<FaList />} label="Watchlist" />
          <MobileNavLink to={`/movies/recommendations`} icon={<FaRobot />} label="AI Recommendations" />
          <MobileNavLink to={`/users/${userId}`} icon={<FaUser />} label="Profile" />

          {userStatus === "basic" && (
            <div
              onClick={handleUpgradeAccount}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 16px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #4f46e5 0%, #6d28d9 100%)",
                color: "white",
                fontWeight: "500",
                cursor: "pointer",
                marginTop: "8px"
              }}
            >
              <FaCrown size={16} /> Upgrade to Premium
            </div>
          )}
        </div>
      </motion.div>

      <style jsx>{`
        @media (max-width: 850px) {
          .nav-links-desktop {
            display: none !important;
          }

          .menu-toggle {
            display: block !important;
          }

          .nav-right {
            display: none !important;
          }
        }
      `}</style>
    </motion.nav>
  );
}

// Helper component for desktop nav links
function NavLinkStyled({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 12px",
        borderRadius: "20px",
        color: isActive ? "white" : "#9b9db8",
        background: isActive ? "rgba(255, 255, 255, 0.1)" : "transparent",
        textDecoration: "none",
        fontWeight: "500",
        fontSize: "0.9rem",
        transition: "all 0.2s ease"
      })}
    >
      {icon} {label}
    </NavLink>
  );
}

// Helper component for mobile nav links
function MobileNavLink({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "12px 16px",
        borderRadius: "8px",
        color: isActive ? "white" : "#9b9db8",
        background: isActive ? "rgba(255, 255, 255, 0.1)" : "transparent",
        textDecoration: "none",
        fontWeight: "500",
        fontSize: "0.95rem"
      })}
    >
      {icon} {label}
    </NavLink>
  );
}
