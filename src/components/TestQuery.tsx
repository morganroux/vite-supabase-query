import {
  Checkbox,
  Container,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RowType } from "@/types/rows";
import { Add } from "@mui/icons-material";
import toast from "react-hot-toast";
import supabase from "@/utils/supabase";

const putRow = async (data: { id: string; info: string; checked: boolean }) => {
  const { id, ...body } = data;
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const res = await supabase.from("rows").update(body).eq("id", id);
};

const getRows = async () => {
  const toastId = toast.loading("Loading...");
  const rows = await supabase
    .from("rows")
    .select("*")
    .order("id", { ascending: true });
  toast.success("Loaded", { id: toastId });
  return rows.data ?? ([] as RowType[]);
};

const getRow = async (id: string) => {
  const row = await supabase.from("rows").select("*").eq("id", id).single();
  return row.data as RowType;
};

const postRow = async (data: { info: string }) => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const response = await supabase.from("rows").insert(data);
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
    mutationFn: putRow,
    // Always refetch after error or success:
    onSettled: async (data, err, variables) => {
      return await queryClient.invalidateQueries({
        queryKey: ["rows"],
      });
    },
  });

  const postRowMutation = useMutation({
    mutationFn: postRow,
    onError(error, variables, context) {
      console.log("Error", error);
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ["rows"] });
    },
  });

  const optimisticRows = putRowMutation.isPending
    ? rows?.map((row) => {
        if (row.id === putRowMutation.variables.id) {
          return {
            ...row,
            checked: putRowMutation.variables.checked,
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
          </Stack>
        ))
      )}
      {postRowMutation.isPending && (
        <Stack
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
      )}
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
