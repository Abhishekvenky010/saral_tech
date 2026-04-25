"use client";

import axios from "axios";
import { useCallback, useEffect, useState, memo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

const TodoItem = memo(({ todo, onToggle, onDelete }) => (
  <li
    className={`flex justify-between items-center p-4 border rounded-lg ${
      todo.isCompleted ? "bg-green-900 border-green-700" : "bg-orange-900 border-orange-700"
    }`}
  >
    <span
      onClick={() => onToggle(todo)}
      className={`cursor-pointer flex-1 text-lg font-semibold ${
        todo.isCompleted ? "line-through text-green-400" : "text-orange-400"
      }`}
    >
      {todo.title}
    </span>
    <button
      onClick={() => onDelete(todo)}
      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
    >
      Delete
    </button>
  </li>
));

const Home = memo(function Home() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const { token, logout, isAuthenticated, isLoading } = useAuth();

  // 🔄 FETCH TODOS
  const fetchTodos = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        "http://localhost:1337/api/todos",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTodos(res.data.data || []);
    } catch (err) {
      const message = err.response?.data?.error?.message || "Failed to fetch todos";
      setError(message);
      console.log("FETCH ERROR:", err.response?.data);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ➕ ADD TODO
  const addTodo = useCallback(async () => {
    if (!title.trim() || !token) return;

    const newTodo = { title, isCompleted: false };
    setTodos(prev => [...prev, { ...newTodo, documentId: Date.now().toString() }]); // optimistic
    setTitle("");

    try {
      setError("");
      const res = await axios.post(
        "http://localhost:1337/api/todos",
        {
          data: newTodo,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update with real data
      setTodos(prev => prev.map(todo =>
        todo.documentId === newTodo.documentId ? res.data.data : todo
      ));
    } catch (err) {
      const message = err.response?.data?.error?.message || "Failed to add todo";
      setError(message);
      console.log("CREATE ERROR:", err.response?.data);
      // Revert optimistic update
      setTodos(prev => prev.filter(todo => todo.documentId !== newTodo.documentId));
      setTitle(title); // restore title
    }
  }, [title, token]);

  // 🔁 TOGGLE TODO
  const toggleTodo = useCallback(async (todo) => {
    if (!token) return;

    const original = todo.isCompleted;
    setTodos(prev => prev.map(t =>
      t.documentId === todo.documentId ? { ...t, isCompleted: !t.isCompleted } : t
    ));

    try {
      setError("");
      await axios.put(
        `http://localhost:1337/api/todos/${todo.documentId}`,
        {
          data: {
            isCompleted: !original,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (err) {
      const message = err.response?.data?.error?.message || "Failed to update todo";
      setError(message);
      console.log("UPDATE ERROR:", err.response?.data);
      // Revert
      setTodos(prev => prev.map(t =>
        t.documentId === todo.documentId ? { ...t, isCompleted: original } : t
      ));
    }
  }, [token]);

  // ❌ DELETE TODO
  const deleteTodo = useCallback(async (todo) => {
    if (!token) return;

    const original = todo;
    setTodos(prev => prev.filter(t => t.documentId !== todo.documentId));

    try {
      setError("");
      await axios.delete(
        `http://localhost:1337/api/todos/${todo.documentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (err) {
      const message = err.response?.data?.error?.message || "Failed to delete todo";
      setError(message);
      console.log("DELETE ERROR:", err.response?.data);
      // Revert
      setTodos(prev => [...prev, original]);
    }
  }, [token]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/signin");
    }
  }, [isAuthenticated, isLoading, router]);

  // 🔄 LOAD TODOS
  useEffect(() => {
    if (token) fetchTodos();
  }, [token, fetchTodos]);

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-gray-800 rounded-xl shadow-2xl p-6">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Dashboard</h1>

        {error && <p className="text-red-400 mb-4 bg-red-900 p-3 rounded-lg">{error}</p>}

        {/* ➕ ADD TODO */}
        <div className="flex mb-5">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter todo..."
            className="flex-1 p-3 bg-gray-700 text-white rounded-l-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
          />
          <button
            onClick={addTodo}
            className="bg-blue-600 text-white px-6 rounded-r-lg hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
        </div>

        {/* ⏳ LOADING */}
        {loading && <p className="text-blue-400 animate-pulse text-center">Loading...</p>}

        {/* 📋 TODO LIST */}
        {!loading && todos.length === 0 && (
          <p className="text-gray-400 bg-gray-700 p-4 rounded-lg text-center">No tasks yet 🚀</p>
        )}

        <ul className="space-y-3">
          {todos.map((todo) => (
            <TodoItem key={todo.documentId} todo={todo} onToggle={toggleTodo} onDelete={deleteTodo} />
          ))}
        </ul>

        {/* 🔓 LOGOUT */}
        <div className="mt-8">
          <button
            onClick={() => {
              if (confirm("Logout?")) {
                logout();
                router.push("/signin");
              }
            }}
            className="w-full bg-gray-600 text-white p-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
});

export default Home;