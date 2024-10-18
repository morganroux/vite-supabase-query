import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { QueryClientProvider } from "@tanstack/react-query";
import "@/utils/supabase.ts";
import queryClient from "./utils/react-query.ts";
import { Toaster } from "react-hot-toast";
// import './index.css'

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
    <Toaster />
  </StrictMode>
);
