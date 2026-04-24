"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Load from cookies on mount
    const storedToken = Cookies.get("token");
    const storedUser = Cookies.get("user");

    if (storedToken) {
      setToken(storedToken);
    }
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user from cookie");
      }
    }
  }, []);

  const login = (jwt, userData) => {
    setToken(jwt);
    setUser(userData);
    Cookies.set("token", jwt);
    Cookies.set("user", JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    Cookies.remove("token");
    Cookies.remove("user");
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}