import { Navigate, Outlet } from "react-router";
import { useEffect } from "react";
import NavbarUser from "./NavbarUser";
import { motion, AnimatePresence } from "framer-motion";

export default function UserLayout() {
  const access_token = localStorage.getItem("access_token");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    // Add dark theme class to body
    document.body.classList.add("theme-dark");

    return () => {
      document.body.classList.remove("theme-dark");
    };
  }, []);

  if (!access_token) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="app-wrapper">
      <NavbarUser userId={userId} />
      <AnimatePresence mode="wait">
        <motion.main
          className="content-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>

      {/* Background elements */}
      <div className="background-gradient"></div>
      <div className="background-grid"></div>

      <style jsx>{`
        .app-wrapper {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
        }

        .content-container {
          padding-top: 70px;
          position: relative;
          z-index: 1;
        }

        .background-gradient {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(
            circle at 10% 10%,
            rgba(79, 70, 229, 0.15) 0%,
            transparent 60%
          );
          pointer-events: none;
          z-index: 0;
        }

        .background-grid {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: linear-gradient(
              rgba(255, 255, 255, 0.03) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.03) 1px,
              transparent 1px
            );
          background-size: 30px 30px;
          pointer-events: none;
          z-index: 0;
        }
      `}</style>
    </div>
  );
}
