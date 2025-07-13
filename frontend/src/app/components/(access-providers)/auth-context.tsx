"use client";

import { ReactNode, createContext, useContext, useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface User {
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  groups?: string[];
  permissions?: string[];
  company_name?: string;
  group_name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
  inGroup: (group: string | string[]) => boolean;
  hasPermission: (perm: string) => boolean;
  primaryGroup: () => string | null;
}

// Create the AuthContext for managing authentication state and actions
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null); // Current user object
  const [loading, setLoading] = useState<boolean>(true); // Loading state for auth

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
  const authFetch = async (url: string, options: RequestInit = {}) => {
    return fetch(url, { ...options, credentials: "include" });
  };

  const inGroup = (group: string | string[]) => {
    if (!user || !user.groups) return false;
    if (Array.isArray(group)) return group.some((g) => user.groups?.includes(g));
    return user.groups.includes(group);
  };

  const hasPermission = (perm: string) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(perm) || user.permissions.includes("*");
  };

  const primaryGroup = () => {
    if (!user || !user.groups || user.groups.length === 0) return null;
    return user.groups[0];
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, authFetch, inGroup, hasPermission, primaryGroup }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use authentication context in components
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
