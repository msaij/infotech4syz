"use client";

import { createContext, useContext, useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Create the AuthContext for managing authentication state and actions
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // Current user object
  const [loading, setLoading] = useState(true); // Loading state for auth

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

  // Logout: clear user from context (session is cleared on backend)
  const logout = () => {
    setUser(null);
  };

  // Helper for authenticated API calls (always includes credentials)
  const authFetch = async (url, options = {}) => {
    return fetch(url, { ...options, credentials: "include" });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use authentication context in components
export function useAuth() {
  return useContext(AuthContext);
}
