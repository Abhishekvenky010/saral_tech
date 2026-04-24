"use client";
import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Signup() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const router = useRouter();

  const validateForm = () => {
    if (!form.username.trim()) {
      setError("Username is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email");
      return false;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    setError("");
    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    try {
      await axios.post(
        "http://localhost:1337/api/auth/local/register",
        form
      );

      alert("Signup successful");
      router.push("/signin");
    } catch (err) {
      setError(err.response?.data?.error?.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl p-6">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Signup</h1>

        {error && <p className="text-red-400 mb-4 bg-red-900 p-3 rounded-lg">{error}</p>}

        <input
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({...form, username: e.target.value})}
          className="w-full p-3 mb-4 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({...form, email: e.target.value})}
          className="w-full p-3 mb-4 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({...form, password: e.target.value})}
          className="w-full p-3 mb-6 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleSignup}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Signup
        </button>
      </div>
    </div>
  );
}