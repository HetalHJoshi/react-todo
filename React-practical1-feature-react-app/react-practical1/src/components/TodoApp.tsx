import React, { useState, useEffect } from "react";
import "./TodoApp.css";

type Todo = {
  id: number;
  text: string;
  completed: boolean;
  date: string;
};

const STORAGE_KEY = "todosData";

const getTodayDate = () => new Date().toISOString().split("T")[0];

const TodoApp: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<"all" | "completed" | "incomplete">(
    "all"
  );
  const [editId, setEditId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  // Load todos from localStorage if the date matches today
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const today = getTodayDate();

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const storedDate = parsed.date;

        if (storedDate === today) {
          setTodos(parsed.todos);
        } else {
          // Reset only the todos, but keep today's date
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ date: today, todos: [] })
          );
          setTodos([]);
        }
      } catch (error) {
        console.error("Failed to parse localStorage data:", error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Save to localStorage when todos change
  useEffect(() => {
    const today = getTodayDate();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, todos }));
  }, [todos]);

  // Optional: Clear todos at midnight automatically
  useEffect(() => {
    const now = new Date();
    const millisTillMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() -
      now.getTime();

    const timer = setTimeout(() => {
      const today = getTodayDate();
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ date: today, todos: [] })
      );
      setTodos([]);
    }, millisTillMidnight);

    return () => clearTimeout(timer);
  }, []);

  const handleAdd = () => {
    if (input.trim() === "") return;
    const newTodo: Todo = {
      id: Date.now(),
      text: input,
      completed: false,
      date: new Date().toLocaleString(),
    };
    setTodos([newTodo, ...todos]);
    setInput("");
  };

  const handleDelete = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const handleToggle = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const handleEdit = (id: number, text: string) => {
    setEditId(id);
    setEditText(text);
  };

  const handleSave = (id: number) => {
    setTodos(
      todos.map((todo) => (todo.id === id ? { ...todo, text: editText } : todo))
    );
    setEditId(null);
    setEditText("");
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "completed") return todo.completed;
    if (filter === "incomplete") return !todo.completed;
    return true;
  });

  return (
    <div className="todo-container">
      <div className="todo-header">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Enter Todo"
        />
        <button onClick={handleAdd}>Add Todo</button>
      </div>

      <div className="filter">
        <button onClick={() => setFilter("all")}>All</button>
        <button onClick={() => setFilter("completed")}>Completed</button>
        <button onClick={() => setFilter("incomplete")}>Incomplete</button>
      </div>

      <div className="todo-list">
        {filteredTodos.map((todo) => (
          <div
            key={todo.id}
            className={`todo-item ${todo.completed ? "completed" : ""}`}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggle(todo.id)}
            />
            <div className="todo-text">
              {editId === todo.id ? (
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                />
              ) : (
                <>
                  <span className="text">{todo.text}</span>
                  <span className="date">{todo.date}</span>
                </>
              )}
            </div>
            <div className="todo-actions">
              {editId === todo.id ? (
                <button onClick={() => handleSave(todo.id)}>Save</button>
              ) : (
                <button onClick={() => handleEdit(todo.id, todo.text)}>
                  Edit
                </button>
              )}
              <button onClick={() => handleDelete(todo.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodoApp;
