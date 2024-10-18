import {
  Checkbox,
  Container,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

import {
  useMutation,
  useMutationState,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { RowType } from "@/types/rows";
import { Add, Delete } from "@mui/icons-material";
import toast from "react-hot-toast";
import supabase from "@/utils/supabase";

const putRow = async (data: { id: string; info: string; checked: boolean }) => {
  const { id, ...body } = data;
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const res = await supabase.from("rows").update(body).eq("id", id);
};

const getRows = async () => {
  // const toastId = toast.loading("Loading...");
  // await new Promise((resolve) => setTimeout(resolve, 2000));
  const rows = await supabase
    .from("rows")
    .select("*")
    .order("id", { ascending: true });
  // toast.success("Loaded", { id: toastId });
  return rows.data ?? ([] as RowType[]);
};

const getRow = async (id: string) => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const row = await supabase.from("rows").select("*").eq("id", id).single();
  return row.data as RowType;
};

const postRow = async (data: { info: string }) => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  await supabase.from("rows").insert(data);
  return data;
};

const deleteRow = async (id: string) => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  await supabase.from("rows").delete().eq("id", id);
  return id;
};

const TestQuery = () => {
  const queryClient = useQueryClient();

  // Queries
  const { data: rows, isLoading: isLoadingRows } = useQuery({
    queryKey: ["rows"],
    queryFn: getRows,
  });

  // Mutations
  const putRowMutation = useMutation({
    mutationKey: ["rows", "put"],
    mutationFn: putRow,
    // Always refetch after error or success:
    onSettled: async (data, err, variables) => {
      return await queryClient.invalidateQueries({
        queryKey: ["rows"],
      });
    },
  });

  const postRowMutation = useMutation({
    mutationKey: ["rows", "post"],
    mutationFn: postRow,
    onError(error, variables, context) {
      console.log("Error", error);
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ["rows"] });
    },
  });

  const deleteRowMutation = useMutation({
    mutationKey: ["rows", "delete"],
    mutationFn: deleteRow,
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ["rows"] });
    },
  });

  const putRowMutations = useMutationState({
    // this mutation key needs to match the mutation key of the given mutation (see above)
    filters: { mutationKey: ["rows", "put"], status: "pending" },
    select: (mutation) => mutation.state.variables as RowType,
  });
  const deleteRowMutations = useMutationState({
    // this mutation key needs to match the mutation key of the given mutation (see above)
    filters: { mutationKey: ["rows", "delete"], status: "pending" },
    select: (mutation) => ({ id: mutation.state.variables } as { id: string }),
  });
  const postRowMutations = useMutationState({
    // this mutation key needs to match the mutation key of the given mutation (see above)
    filters: { mutationKey: ["rows", "post"], status: "pending" },
    select: (mutation) => mutation.state.variables as RowType,
  });

  const optimisticRows =
    putRowMutations.length ||
    deleteRowMutations.length ||
    postRowMutations.length
      ? rows?.map((row) => {
          const putMut = putRowMutations.find((data) => data.id === row.id);
          const deleteMut = deleteRowMutations.find(
            (data) => data.id === row.id
          );
          if (putMut) {
            return {
              ...row,
              checked: putMut.checked,
            };
          }
          if (deleteMut) {
            return {
              ...row,
              deleted: true,
            };
          }

          return row;
        })
      : rows;
  return (
    <Container maxWidth={false} disableGutters>
      {isLoadingRows ? (
        <Typography>Loading...</Typography>
      ) : (
        optimisticRows?.map((row) => (
          <Stack
            component="li"
            key={row.id}
            sx={{
              flexDirection: "row",
              alignItems: "center",
              opacity: row.deleted ? 0.5 : 1,
            }}
          >
            <Checkbox
              checked={!!row.checked}
              onChange={async (e) => {
                const checked = e.target.checked;

                putRowMutation.mutate({
                  id: row.id,
                  info: row.info,
                  checked,
                });
              }}
            />
            <Typography>{row.info}</Typography>
            <IconButton
              onClick={() => deleteRowMutation.mutate(row.id)}
              color="error"
            >
              <Delete />
            </IconButton>
          </Stack>
        ))
      )}
      {postRowMutations.map((data, index) => (
        <Stack
          key={index}
          component="li"
          sx={{
            flexDirection: "row",
            alignItems: "center",
            opacity: 0.5,
          }}
        >
          <Checkbox disabled checked={false} />
          <Typography>New row</Typography>
        </Stack>
      ))}
      <IconButton
        color="primary"
        onClick={() => {
          postRowMutation.mutate({ info: "New row" });
        }}
      >
        <Add />
      </IconButton>
    </Container>
  );
};

// export const getServerSideProps: GetServerSideProps = async ({
//   req,
//   res,
//   query,
//   locale,
//   locales,
//   defaultLocale,
// }) => {
//   // if (eventCopilotConfig.env === "development") {
//   //   await i18n?.reloadResources();
//   // }
//   const callbackUrl = query.callbackUrl as string;
//   const session = await auth(req, res);
//   if (session)
//     return {
//       redirect: {
//         destination: callbackUrl ?? "/dashboard",
//         permanent: false,
//       },
//     };
//   else {
//     return {
//       props: {
//         // ...(await serverSideTranslations(locale ?? defaultLocale ?? "fr", [
//         //   "common",
//         // ])),
//         // Will be passed to the page component as props
//       },
//     };
//   }
// };

export default TestQuery;
