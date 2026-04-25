"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function Signin() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      setError("");
      const res = await axios.post(
        "http://localhost:1337/api/auth/local",
        {
          identifier: form.email, 
          password: form.password,
        }
      );

      console.log("LOGIN SUCCESS:", res.data);

      // Use context to login
      login(res.data.jwt, res.data.user);

      router.push("/");
    } catch (err) {
      const message = err.response?.data?.error?.message || "Login failed";
      setError(message);
      console.log("LOGIN ERROR:", err.response?.data);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl p-6">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Login</h1>

        {error && <p className="text-red-400 mb-4 bg-red-900 p-3 rounded-lg">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
          className="w-full p-3 mb-4 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
          className="w-full p-3 mb-6 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleLogin}
          className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Login
        </button>
      </div>
    </div>
  );
}