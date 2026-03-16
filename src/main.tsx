import "./polyfills";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const normalizeEntryPath = () => {
  const { pathname, search, hash } = window.location;
  const isLegacyIndexPath = pathname === "/index" || pathname === "/index/" || pathname === "/index.html";

  if (isLegacyIndexPath) {
    window.history.replaceState({}, "", `/${search}${hash}`);
  }
};

normalizeEntryPath();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
