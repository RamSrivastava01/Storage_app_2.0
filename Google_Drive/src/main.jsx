import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import App from "./App.jsx";
const clientId =
   "787366000753-rfosa55rhhv9lpklvj8vumc4bq8djfbb.apps.googleusercontent.com";
createRoot(document.getElementById("root")).render(
   <StrictMode>
      <GoogleOAuthProvider clientId={clientId}>
         <App />
      </GoogleOAuthProvider>
   </StrictMode>,
);
