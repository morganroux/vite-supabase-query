import React, { useCallback, useState } from "react";
import _ from "lodash";

class Undoer {
  private history: { undo: () => void; redo: () => void }[] = [];
  private index = -1;
  private maxIndex: number;

  constructor(maxIndex = 20) {
    this.maxIndex = maxIndex;
  }

  addUndoableAction<T>({
    action,
    prev,
    next,
  }: {
    action: React.Dispatch<React.SetStateAction<T>>;
    prev: T;
    next: T;
  }) {
    this.history = this.history.slice(0, this.index + 1);
    this.history.push({
      undo: () => action(_.cloneDeep(prev)),
      redo: () => action(_.cloneDeep(next)),
    });
    this.index++;
    if (this.history.length >= this.maxIndex) {
      this.history.shift();
      this.index--;
    }
  }

  undo() {
    if (this.index < 0) return;
    this.history[this.index].undo();
    this.index--;
  }

  redo() {
    if (this.index >= this.history.length - 1) return;
    this.index++;
    this.history[this.index].redo();
  }
}

export const undoer = new Undoer();

export const useStateWithUndo = <T>(initialValue: T) => {
  const [state, setState] = useState<T>(initialValue);

  const setStateWithUndo = useCallback((newState: React.SetStateAction<T>) => {
    setState((prevState) => {
      const next =
        typeof newState === "function"
          ? (newState as (prevState: T) => T)(prevState)
          : newState;
      undoer.addUndoableAction({
        action: setState,
        prev: prevState,
        next,
      });
      return next;
    });
  }, []);
  return [state, setStateWithUndo] as const;
};
