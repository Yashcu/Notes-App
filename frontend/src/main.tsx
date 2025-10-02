import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AppToaster } from "./components/ui/toaster";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
    <AppToaster />
  </React.StrictMode>
);
