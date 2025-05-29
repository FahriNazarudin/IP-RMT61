import { useEffect, useState, } from "react";
import http from "../lib/http";
import { Navigate, useNavigate } from "react-router";
import Swal from "sweetalert2";

export default function Login() {
  const [email, setEmail] = useState("user3@mail.com");
  const [password, setPassword] = useState("w");
  const navigate = useNavigate();

  const access_token = localStorage.getItem("access_token");

  if (access_token) {
    return <Navigate to="/" />;
  }

  async function handleCredentialResponse(response) {
    try {

      if (!response || !response.credential) {
        throw new Error("Invalid Google response");
      }
      
      const backendResponse = await http({
        method: "POST",
        url: "/google-login",
        data: {
          googleToken: response.credential, 
        },
      });
      
      console.log(backendResponse.data, "<<<<<<< backendResponse.data");
      localStorage.setItem("access_token", backendResponse.data.access_token);
      localStorage.setItem("userId", backendResponse.data.userId);
      localStorage.setItem("status", backendResponse.data.status);
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Login successful!",
        showConfirmButton: false,
        timer: 1500,
      });
       

      
      // console.log( localStorage.setItem("status", backendResponse.data, "<<<<<" ));
      
      navigate("/");
    } catch (error) {
      console.error("Google login error:", error);
      
      Swal.fire({
        icon: "error",
        title: "Google Login Failed",
        text: error.response?.data?.message || "Something went wrong with Google login",
      });
    }
  
  }

  useEffect(() => {
    google.accounts.id.initialize({
      client_id:
        "286322794195-c13r4m1bso49nhb4kjo6t9oo344jl0ku.apps.googleusercontent.com",
      callback: handleCredentialResponse,
    });
    google.accounts.id.renderButton(
      document.getElementById("buttonDiv"),
      { theme: "outline", size: "large" } 
    );
    google.accounts.id.prompt();
  }, []);

  return (
    <>
      <div className=" container">
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            try {
              const response = await http({
                method: "POST",
                url: "/login",
                data: {
                  email: email,
                  password: password,
                },
              });
              console.log(response.data, );
              Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Your work has been saved",
                showConfirmButton: false,
                timer: 1500,
              });
              localStorage.setItem("access_token", response.data.access_token);
              localStorage.setItem("userId", response.data.userId);
              localStorage.setItem("status", response.data.status);
              //   console.log(response.data, "INI APA");

              navigate("/");
            } catch (error) {
              console.log(error.response.data, "error");
              Swal.fire({
                icon: "error",
                title: "Oops...",
                text: error.response.data.message || "Something went wrong!",
              });
            }
          }}
        >
          <div className="mb-3">
            <label htmlFor="exampleInputEmail1" className="form-label">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="form-control"
              id="exampleInputEmail1"
              aria-describedby="emailHelp"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="exampleInputPassword1" className="form-label">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="form-control"
              id="exampleInputPassword1"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </form>

        <div id="buttonDiv"></div>
      </div>
    </>
  );
}
