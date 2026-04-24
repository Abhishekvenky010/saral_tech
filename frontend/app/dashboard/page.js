"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const TodoItem = ({ todo, onToggle, onDelete }) => (
  <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 hover:scale-105 transform">
    <div className="flex items-center space-x-3">
      <button
        onClick={() => onToggle(todo)}
        className="w-6 h-6 rounded-full border-2 border-gray-400 flex items-center justify-center hover:border-blue-400 transition-colors"
      >
        {todo.isCompleted ? (
          <span className="text-green-400 text-sm">●</span>
        ) : (
          <span className="text-gray-400 text-sm">○</span>
        )}
      </button>
      <div>
        <p className={`font-semibold text-white ${todo.isCompleted ? 'line-through opacity-50' : ''}`}>
          {todo.title}
        </p>
        <p className={`text-sm ${todo.isCompleted ? 'text-green-400' : 'text-gray-400'}`}>
          {todo.isCompleted ? 'Completed' : 'Pending'}
        </p>
      </div>
    </div>
    <button
      onClick={() => onDelete(todo)}
      className="text-red-400 hover:text-red-300 transition-colors p-2"
    >
      🗑️
    </button>
  </div>
);

export default function Dashboard() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const { token, logout } = useAuth();

  // Fetch todos
  const fetchTodos = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:1337/api/todos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTodos(res.data.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Add todo
  const addTodo = async () => {
    if (!title.trim() || !token) return;
    try {
      await axios.post(
        "http://localhost:1337/api/todos",
        { data: { title, isCompleted: false } },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle("");
      fetchTodos();
    } catch (err) {
      console.error("Add error:", err);
    }
  };

  // Toggle todo
  const toggleTodo = async (todo) => {
    if (!token) return;
    try {
      await axios.put(
        `http://localhost:1337/api/todos/${todo.documentId}`,
        { data: { isCompleted: !todo.isCompleted } },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTodos();
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  // Delete todo
  const deleteTodo = async (todo) => {
    if (!token) return;
    try {
      await axios.delete(`http://localhost:1337/api/todos/${todo.documentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTodos();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-white">Recently added</h1>
          <button className="text-gray-400 hover:text-white text-xl">⋮</button>
        </div>

        {/* Add Todo */}
        <div className="flex mb-6">
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
            className="px-4 py-3 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
        </div>

        {/* Todo List */}
        {loading ? (
          <p className="text-gray-400 text-center">Loading...</p>
        ) : todos.length === 0 ? (
          <p className="text-gray-400 text-center bg-gray-700 p-4 rounded-lg">No tasks yet 🚀</p>
        ) : (
          <div className="space-y-3">
            {todos.map((todo) => (
              <TodoItem
                key={todo.documentId}
                todo={todo}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
              />
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8">
          <button
            onClick={() => {
              if (confirm("Logout?")) {
                logout();
                window.location.href = "/signin";
              }
            }}
            className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}