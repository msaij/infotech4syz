"use client";

import { createContext, useContext, useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Create the AuthContext
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, check for token in localStorage and fetch user ONCE
  useEffect(() => {
    let isMounted = true;
    const storedToken = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (storedToken) {
      setToken(storedToken);
      fetch(`${API_URL}/api/users/me/`, {
        headers: { Authorization: `Token ${storedToken}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (isMounted) setUser(data);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    } else {
      setLoading(false);
    }
    return () => {
      isMounted = false;
    };
  }, []);

  // Login: store token and user
  const login = (token, user) => {
    setToken(token);
    setUser(user);
    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", token);
    }
  };

  // Logout: clear token and user
  const logout = () => {
    setToken(null);
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      // Remove all session cookies (defensive)
      document.cookie = "sessionid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
  };

  // Helper for authenticated API calls
  const authFetch = async (url, options = {}) => {
    const authToken = token || (typeof window !== "undefined" ? localStorage.getItem("authToken") : null);
    const headers = {
      ...(options.headers || {}),
      ...(authToken ? { Authorization: `Token ${authToken}` } : {}),
    };
    return fetch(url, { ...options, headers });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  return useContext(AuthContext);
}
