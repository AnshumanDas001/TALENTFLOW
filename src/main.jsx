import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { ToasterProvider } from "@/components/ui/toaster";
import "./index.css";
import { ClerkProvider } from "@clerk/clerk-react";
import { shadesOfPurple } from "@clerk/themes";
import { makeServer } from "./mocks/server";

// Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Enable Mirage in development, and optionally in production via flag
const ENABLE_MOCKS = import.meta.env.VITE_ENABLE_MOCKS === "true";
if (import.meta.env.DEV || ENABLE_MOCKS) {
  makeServer({ environment: import.meta.env.DEV ? "development" : "production" });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {PUBLISHABLE_KEY ? (
      <ClerkProvider
        appearance={{
          baseTheme: shadesOfPurple,
        }}
        publishableKey={PUBLISHABLE_KEY}
        afterSignOutUrl="/"
      >
        <ToasterProvider>
          <App />
        </ToasterProvider>
      </ClerkProvider>
    ) : (
      <ToasterProvider>
        <App authEnabled={false} />
      </ToasterProvider>
    )}
  </React.StrictMode>
);
