import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import "@/utils/supabase.ts";
import queryClient, { localStoragePersister } from "./utils/react-query.ts";
import "@/utils/pouchdb";
import { Toaster } from "react-hot-toast";
import { registerServiceWorker } from "./workers/serviceWorker.ts";
import { UndoRedoProvider } from "./utils/undoer.tsx";
// import './index.css'

// registerServiceWorker();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: localStoragePersister }}
      onSuccess={() => {
        // resume mutations after initial restore from localStorage was successful
        queryClient.resumePausedMutations().then(() => {
          queryClient.invalidateQueries();
        });
      }}
    >
      <UndoRedoProvider>
        <App />
      </UndoRedoProvider>
      <ReactQueryDevtools initialIsOpen />
    </PersistQueryClientProvider>
    <Toaster />
  </StrictMode>
);
