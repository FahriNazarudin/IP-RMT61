import { Navigate, Outlet } from "react-router";
import Navbar from "./Navbar";

export default function AuthLayout() {

    const access_token = localStorage.getItem("access_token");
    const userId = localStorage.getItem("userId");
    if(!access_token) {
        return(
            <>
            <Navigate to="/login" />
            </>
        )

    }


    return(
        <>
        <Navbar userId={userId}/>
        <Outlet />
        </>
    )
}