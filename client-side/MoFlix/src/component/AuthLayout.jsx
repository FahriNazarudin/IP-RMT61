import { Navigate, Outlet } from "react-router";
import Navbar from "./Navbar";
import { useEffect } from "react";

export default function AuthLayout() {
  const access_token = localStorage.getItem("access_token");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    // Ensure user_status is set
    if (!localStorage.getItem("user_status")) {
      localStorage.setItem("user_status", "basic");
    }
  }, []);

  if (!access_token) {
    return (
      <>
        <Navigate to="/login" />
      </>
    );
  }

  return (
    <>
      <Navbar userId={userId} />
      <Outlet />
    </>
  );
}
