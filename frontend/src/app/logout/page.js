"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/(access-providers)/auth-context";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LogoutPage() {
  const router = useRouter();
  const [csrfToken, setCsrfToken] = useState("");
  const { logout: logoutContext } = useAuth();

  // Fetch CSRF token on mount for secure logout
  useEffect(() => {
    fetch(`${API_URL}/api/csrf/`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setCsrfToken(data.csrfToken))
      .catch(() => {});
  }, []);

  // Handle logout: POST to backend, clear user context, redirect to login
  const handleLogout = async () => {
    await fetch(`${API_URL}/api/session-logout/`, {
      method: "POST",
      headers: { "X-CSRFToken": csrfToken },
      credentials: "include",
    });
    logoutContext(); // Clear user context
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black py-16 px-4">
      <div className="w-full max-w-md bg-gray-100 p-8 rounded-lg shadow text-center">
        <h1 className="text-3xl font-bold mb-6">Logout</h1>
        <button
          onClick={handleLogout}
          className="bg-black text-white px-6 py-2 rounded hover:bg-gray-900 transition font-semibold"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
