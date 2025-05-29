import { useState } from "react";
import http from "../lib/http";
import { Navigate, useNavigate } from "react-router";
import Swal from "sweetalert2";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const access_token = localStorage.getItem("access_token");

  if (access_token) {
    return <Navigate to="/" />;
  }
  return (
    <>
    <div className=" container">
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          try {
            const response = await http({
              method: "POST",
              url: "/register",
              data: {
                username: username,
                email: email,
                password: password,
              },
            });
            console.log(response.data);
            Swal.fire({
              position: "top-end",
              icon: "success",
              title: "Your work has been saved",
              showConfirmButton: false,
              timer: 1500,
            });
            navigate('/login')
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
          <label htmlFor="exampleInputUsername1" className="form-label">
            Username
          </label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            type="text"
            placeholder="Enter your username"
            className="form-control"
            id="exampleInputUsername1"
            aria-describedby="UsernameHelp"
          />
        </div>
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
    </div>
    </>
  );
}
