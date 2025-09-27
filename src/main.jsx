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

if (import.meta.env.DEV) {
  makeServer();
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
