import { Navigate, Outlet } from "react-router";

import NavbarUser from "./NavbarUser";

export default function AuthLayout() {
  const access_token = localStorage.getItem("access_token");
  const userId = localStorage.getItem("userId");
  if (!access_token) {
    return (
      <>
        <Navigate to="/login" />
      </>
    );
  }

  return (
    <>
      <NavbarUser userId={userId} />
      <Outlet />
    </>
  );
}
