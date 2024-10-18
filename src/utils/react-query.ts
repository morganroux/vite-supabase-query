import { QueryClient } from "@tanstack/react-query";

export const editing = new Map<string, number>();

const queryClient = new QueryClient();
export default queryClient;
