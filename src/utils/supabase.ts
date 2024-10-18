import { createClient } from "@supabase/supabase-js";
import queryClient, { editing } from "./react-query";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const handleChanges = (queryKey: string[]) => {
  const strKeys = queryKey.join(",");
  console.log("Handling changes", queryKey);
  if (editing.has(strKeys) && editing.get(strKeys)! > 0) return;
  console.log("Invalidating", queryKey);

  // During an update, the user has already invalidated the query in onSettled, but we reinvalidate anyway

  queryClient.invalidateQueries({ queryKey });
};

supabase
  .channel("rows")
  .on("postgres_changes", { event: "*", schema: "public", table: "rows" }, () =>
    handleChanges(["rows"])
  )
  .subscribe();

export default supabase;
