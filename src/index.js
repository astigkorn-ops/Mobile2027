import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";
import * as serviceWorkerRegistration from './utils/serviceWorkerRegistration';
import cacheManager from './utils/cacheManager';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Register service worker for offline support
serviceWorkerRegistration.register({
  onSuccess: () => {
    // Pre-cache critical data after service worker is ready
    cacheManager.preCacheCriticalData().catch(err => {
      console.error('Failed to pre-cache critical data:', err);
    });
  },
  onUpdate: (registration) => {
    if (window.confirm('New version available! Refresh to update?')) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }
});
