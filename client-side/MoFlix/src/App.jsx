import Home from "./pages/Home";
import { BrowserRouter, Routes, Route } from "react-router";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Detail from "./pages/Detail";
import EditProfile from "./pages/EditProfile";
import AuthLayout from "./component/AuthLayout";
import Profile from "./pages/Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<AuthLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/movies/:id" element={<Detail />} />
          <Route path="/users/:id" element={<Profile />} />
          <Route path="/users/:id/edit" element={<EditProfile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
