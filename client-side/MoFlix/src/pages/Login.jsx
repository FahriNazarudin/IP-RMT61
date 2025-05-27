import { useState } from "react";
import http from "../lib/http";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";

export default function Login() {

  const [email, setEmail] = useState("user3@mail.com");
  const [password, setPassword] = useState("w");
  const navigate = useNavigate();

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
              console.log(response.data);
              Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Your work has been saved",
                showConfirmButton: false,
                timer: 1500,
              });
              localStorage.setItem("access_token", response.data.access_token);

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
      </div>
    </>
  );
}
