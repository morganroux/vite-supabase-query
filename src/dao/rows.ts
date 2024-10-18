import toast from "react-hot-toast";
import supabase from "@/utils/supabase";
import { RowType } from "@/types/rows";

export const putRow = async (data: {
  id: string;
  info: string;
  checked: boolean;
}) => {
  const { id, ...body } = data;
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const res = await supabase.from("rows").update(body).eq("id", id);
};

export const getRows = async () => {
  const toastId = toast.loading("Loading...");
  // await new Promise((resolve) => setTimeout(resolve, 1000));
  const rows = await supabase
    .from("rows")
    .select("*")
    .order("id", { ascending: true });
  toast.success("Loaded", { id: toastId });
  return rows.data ?? ([] as RowType[]);
};

export const getRow = async (id: string) => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const row = await supabase.from("rows").select("*").eq("id", id).single();
  return row.data as RowType;
};

export const postRow = async (data: { info: string }) => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  await supabase.from("rows").insert(data);
  return data;
};

export const deleteRow = async (id: string) => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  await supabase.from("rows").delete().eq("id", id);
  return id;
};
