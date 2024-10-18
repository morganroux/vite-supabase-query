import {
  Checkbox,
  Container,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RowType } from "@/types/rows";
import { Add, Delete } from "@mui/icons-material";
import { getRows, putRow, postRow, deleteRow } from "@/dao/rows";
import { editing } from "@/utils/react-query";

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
    onMutate: async (data) => {
      editing.set("rows", (editing.get("rows") ?? 0) + 1);
      await queryClient.cancelQueries({ queryKey: ["rows"] });
      const previousRows = queryClient.getQueryData(["rows"]);
      queryClient.setQueryData(["rows"], (old: RowType[] | undefined) => {
        return old?.map((row) =>
          row.id === data.id ? { ...row, checked: data.checked } : row
        );
      });
      return { previousRows };
    },
    onSettled: async (data, err, variables) => {
      editing.set("rows", (editing.get("rows") ?? 0) - 1);
      // if websocket is enabled, we don't need to invalidate the query
      if (editing.get("rows") == 0)
        await queryClient.invalidateQueries({ queryKey: ["rows"] });
    },
  });

  const postRowMutation = useMutation({
    mutationKey: ["rows", "post"],
    mutationFn: postRow,
    onMutate: async (data) => {
      editing.set("rows", (editing.get("rows") ?? 0) + 1);

      await queryClient.cancelQueries({ queryKey: ["rows"] });
      const previousRows = queryClient.getQueryData(["rows"]);
      queryClient.setQueryData(["rows"], (old: RowType[] | undefined) => {
        return [
          ...old!,
          {
            id: Math.random().toString(36).substring(7),
            info: data.info,
            checked: false,
            created: true,
          },
        ];
      });
      return { previousRows };
    },
    onError(error, variables, context) {
      console.log("Error", error);
    },
    onSettled: async (data, err, variables) => {
      editing.set("rows", (editing.get("rows") ?? 0) - 1);

      if (editing.get("rows") == 0)
        await queryClient.invalidateQueries({ queryKey: ["rows"] });
    },
  });

  const deleteRowMutation = useMutation({
    mutationKey: ["rows", "delete"],
    mutationFn: deleteRow,
    onMutate: async (id) => {
      editing.set("rows", (editing.get("rows") ?? 0) + 1);

      await queryClient.cancelQueries({ queryKey: ["rows"] });
      const previousRows = queryClient.getQueryData(["rows"]);
      queryClient.setQueryData(["rows"], (old: RowType[] | undefined) => {
        return old?.map((row) =>
          row.id === id ? { ...row, deleted: true } : row
        );
      });
      return { previousRows };
    },
    onSettled: async (data, err, variables) => {
      editing.set("rows", (editing.get("rows") ?? 0) - 1);
      if (editing.get("rows") == 0)
        await queryClient.invalidateQueries({ queryKey: ["rows"] });
    },
  });

  return (
    <Container maxWidth={false} disableGutters>
      {isLoadingRows ? (
        <Typography>Loading...</Typography>
      ) : (
        rows?.map((row) => (
          <Stack
            component="li"
            key={row.id}
            sx={{
              flexDirection: "row",
              alignItems: "center",
              opacity: row.deleted || row.created ? 0.5 : 1,
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
              disabled={row.deleted || row.created}
              onClick={() => deleteRowMutation.mutate(row.id)}
              color="error"
            >
              <Delete />
            </IconButton>
          </Stack>
        ))
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

export default TestQuery;
