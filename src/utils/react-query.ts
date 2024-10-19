import { QueryClient } from "@tanstack/react-query";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

export const editing = new Map<string, number>();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      // staleTime: 10000,
      // retry: 0,
    },
  },
});

export const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,

});


export default queryClient;
