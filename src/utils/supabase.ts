import { createClient } from "@supabase/supabase-js";
import queryClient from "./react-query";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const handleInserts = (queryKey: string[]) => {
  queryClient.invalidateQueries({ queryKey });
};

supabase
  .channel("rows")
  .on("postgres_changes", { event: "*", schema: "public", table: "rows" }, () =>
    handleInserts(["rows"])
  )
  .subscribe();

export default supabase;
