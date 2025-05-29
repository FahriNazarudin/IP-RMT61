// Import React and ReactDOM
import React from "react";
import ReactDOM from "react-dom/client";

// Import main App component
import App from "./App";

// Import global CSS
import "./styles/global.css";

// Render the React application
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
