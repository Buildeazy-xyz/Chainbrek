import React from "react";
import ReactDOM from "react-dom/client";
import ChainbrekApp from "./App.jsx"; // must match export
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ChainbrekApp />
  </React.StrictMode>
);
