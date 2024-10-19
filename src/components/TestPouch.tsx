import { useEffect, useState } from "react";
import { localDB } from "@/utils/pouchdb";

const createTodo = async () => {
  const todo = {
    _id: new Date().toISOString(),
    info: "New todo",
    checked: false,
  };
  try {
    await localDB.put(todo);
    console.log("Todo created:", todo);
  } catch (err) {
    console.error("Error creating todo:", err);
  }
};
const TestPouch = () => {
  const [todos, setTodos] = useState<any[]>([]);
  const [syncStatus, setSyncStatus] = useState("");
  useEffect(() => {
    // Fetch existing todos from local PouchDB
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const result = await localDB.allDocs({ include_docs: true });
      const todosData = result.rows.map<any>((row) => row.doc);
      setTodos(todosData);
    } catch (err) {
      console.error("Error fetching todos:", err);
    }
  };

  return (
    <div>
      <h1>Todos</h1>
      <ul>
        {todos.map((todo) => (
          <li key={todo._id}>
            <span>
              {todo.info} - {todo.checked ? "Done" : "Not Done"}
            </span>
          </li>
        ))}
      </ul>
      <button onClick={createTodo}>Create</button>
      <p>{syncStatus}</p>
    </div>
  );
};

export default TestPouch;
