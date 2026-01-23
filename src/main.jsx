import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Suppress intrusive browser extension errors (specifically giveFreely)
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.stack && event.reason.stack.includes('giveFreely')) {
    event.preventDefault(); // Prevent it from showing as an error in console
  }
});

window.addEventListener('error', (event) => {
  if (event.filename && event.filename.includes('giveFreely')) {
    event.preventDefault();
  }
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
