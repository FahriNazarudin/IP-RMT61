import { Navigate, Outlet } from "react-router";
import Navbar from "./Navbar";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthLayout() {
  const access_token = localStorage.getItem("access_token");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    // Ensure user_status is set
    if (!localStorage.getItem("user_status")) {
      localStorage.setItem("user_status", "basic");
    }

    // Add dark theme class to body
    document.body.style.backgroundColor = "var(--color-background)";
    document.body.style.color = "var(--color-text)";

    return () => {
      // Cleanup if needed
    };
  }, []);

  if (!access_token) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="app-layout">
      <Navbar userId={userId} />

      <AnimatePresence mode="wait">
        <motion.main
          className="main-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>

      {/* Background elements for techie feel */}
      <div className="bg-grid"></div>
      <div className="bg-glow"></div>

      <style jsx>{`
        .app-layout {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
        }

        .main-content {
          padding-top: 20px;
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          padding: 20px;
        }

        .bg-grid {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 30px 30px;
          pointer-events: none;
          z-index: -1;
        }

        .bg-glow {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background:
            radial-gradient(circle at 15% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 25%),
            radial-gradient(circle at 85% 30%, rgba(109, 40, 217, 0.15) 0%, transparent 25%);
          pointer-events: none;
          z-index: -2;
        }
      `}</style>
    </div>
  );
}
