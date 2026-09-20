import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import "./styles/global.css";
import App from "./App.tsx";
import { HelmetProvider } from "react-helmet-async";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        reg.update();
      })
      .catch((error) => {
        console.warn("Service Worker registration failed:", error);
      });

    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data?.type === "PLAY_NOTIFICATION_SOUND") {
        try {
          const audio = new Audio("/Notification.mp3");
          audio.volume = 0.8;
          audio.play().catch(() => {});
        } catch {}
      }
    });
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </ErrorBoundary>
  </StrictMode>,
);
