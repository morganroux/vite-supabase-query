import { QueryClient } from "@tanstack/react-query";

export const editing = new Map<string, number>();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
});
export default queryClient;
