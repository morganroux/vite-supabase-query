import React, { createContext, useCallback, useContext, useState } from "react";
import _ from "lodash";

class Undoer {
  private history: { undo: () => void; redo: () => void }[] = [];
  private index = -1;
  private maxIndex: number;

  constructor(maxIndex = 20) {
    this.maxIndex = maxIndex;
  }

  addUndoableAction(props: { undoAction: () => void; redoAction: () => void }) {
    if (this.index < this.history.length - 1)
      this.history = this.history.slice(0, this.index + 1);
    this.history.push({
      undo: props.undoAction,
      redo: props.redoAction,
    });
    this.index++;
    if (this.history.length >= this.maxIndex) {
      this.history.shift();
      this.index--;
    }
  }

  canUndo() {
    return this.index >= 0;
  }

  canRedo() {
    return this.index < this.history.length - 1;
  }

  undo() {
    if (!this.canUndo()) return;
    this.history[this.index].undo();
    this.index--;
  }

  redo() {
    if (!this.canRedo()) return;
    this.index++;
    this.history[this.index].redo();
  }
}

const undoer = new Undoer();

export const useStateWithUndo = <T,>(initialValue: T) => {
  console.log("useStateWithUndo");
  const [state, setState] = useState<T>(initialValue);
  const { addUndoableAction } = useUndoRedo();

  const setStateWithUndo = useCallback((newState: React.SetStateAction<T>) => {
    setState((prevState) => {
      const next =
        typeof newState === "function"
          ? (newState as (prevState: T) => T)(prevState)
          : newState;
      addUndoableAction({
        undoAction: () => setState(_.cloneDeep(prevState)),
        redoAction: () => setState(_.cloneDeep(next)),
      });

      return next;
    });
  }, []);
  return [state, setStateWithUndo] as const;
};

// Create a Context to expose undo/redo state and actions
const UndoRedoContext = createContext<{
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  addUndoableAction: (props: {
    undoAction: () => void;
    redoAction: () => void;
  }) => void;
} | null>(null);

// Create a provider component
export const UndoRedoProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  console.log("UndoRedoProvider");
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Update the undo/redo state whenever undoer changes
  const updateUndoRedoState = useCallback(() => {
    setCanUndo(undoer.canUndo());
    setCanRedo(undoer.canRedo());
  }, []);

  const handleUndo = useCallback(() => {
    undoer.undo();
    updateUndoRedoState();
  }, [updateUndoRedoState]);

  const handleRedo = useCallback(() => {
    undoer.redo();
    updateUndoRedoState();
  }, [updateUndoRedoState]);

  const addUndoableAction = useCallback(
    (props: { undoAction: () => void; redoAction: () => void }) => {
      undoer.addUndoableAction(props);
      updateUndoRedoState();
    },
    [updateUndoRedoState]
  );

  return (
    <UndoRedoContext.Provider
      value={{
        canUndo,
        canRedo,
        undo: handleUndo,
        redo: handleRedo,
        addUndoableAction,
      }}
    >
      {children}
    </UndoRedoContext.Provider>
  );
};

// Custom hook to access undo/redo context easily
export const useUndoRedo = () => {
  const context = useContext(UndoRedoContext);
  if (!context) {
    throw new Error("useUndoRedo must be used within an UndoRedoProvider");
  }
  return context;
};
