"use client";

import { createContext, useContext, useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Create the AuthContext
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, check for user session ONCE
  useEffect(() => {
    let isMounted = true;
    fetch(`${API_URL}/api/users/me/`, {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted) setUser(data);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Login: fetch user after session login
  const login = async () => {
    setLoading(true);
    const res = await fetch(`${API_URL}/api/users/me/`, {
      credentials: "include",
    });
    if (res.ok) {
      const userData = await res.json();
      setUser(userData);
    }
    setLoading(false);
  };

  // Logout: clear user
  const logout = () => {
    setUser(null);
  };

  // Helper for authenticated API calls
  const authFetch = async (url, options = {}) => {
    return fetch(url, { ...options, credentials: "include" });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  return useContext(AuthContext);
}
