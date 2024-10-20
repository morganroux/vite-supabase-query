import { useStateWithUndo, useUndoRedo } from "@/utils/undoer";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

const TestUndo = () => {
  const [count1, setCount1] = useStateWithUndo(0);
  const [count2, setCount2] = useStateWithUndo(0);
  const { undo, redo, canUndo, canRedo } = useUndoRedo();
  console.log("rerednere");
  return (
    <Stack>
      <Stack direction="row" sx={{ gap: 3 }}>
        <Typography>Count1: {count1}</Typography>
        <Typography>Count2: {count2}</Typography>
      </Stack>
      <Stack direction="row">
        <Button onClick={() => setCount1((count) => count + 1)}>
          Increment count1
        </Button>
        <Button onClick={() => setCount2(count2 + 1)}>Increment count2</Button>
        <Button disabled={!canUndo} onClick={() => undo()}>
          Undo
        </Button>
        <Button disabled={!canRedo} onClick={() => redo()}>
          Redo
        </Button>
      </Stack>
    </Stack>
  );
};
export default TestUndo;
