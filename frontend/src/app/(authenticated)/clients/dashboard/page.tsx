"use client";

import { useAuth } from "@/components/(access-providers)/auth-context";
import LoadingPage from "@/components/LoadingPage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ClientsDashboard() {
  const { user, loading, logout, authFetch } = useAuth();
  const router = useRouter();
  const [csrfToken, setCsrfToken] = useState("");

  // Fetch CSRF token on mount
  useEffect(() => {
    authFetch(`${API_URL}/api/csrf/`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setCsrfToken(data.csrfToken))
      .catch(() => {});
  }, [authFetch]);

  const handleLogout = async () => {
    await authFetch(`${API_URL}/api/session-logout/`, {
      method: "POST",
      headers: { "X-CSRFToken": csrfToken },
      credentials: "include",
    });
    logout();
    router.replace("/login");
  };

  if (loading) return <LoadingPage />;

  // Define quick actions for client users (exclude /start/* links)
  const quickActions = [
    {
      title: "Profile",
      description: "Update your information",
      icon: "person",
      href: "/clients/profile",
      color: "bg-green-500"
    },
    {
      title: "Contact Support",
      description: "Get help when needed",
      icon: "support_agent",
      href: "/contact",
      color: "bg-purple-500"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {user ? `Welcome, ${user.username || user.email}!` : "Welcome!"}
              </h1>
              <p className="mt-1 text-sm sm:text-base text-gray-600">
                {user && (
                  <span>Logged in as: <span className="font-semibold">{user.email || user.username}</span></span>
                )}
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-gray-400">
                  schedule
                </span>
                <span className="text-sm text-gray-600">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded shadow transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className={`${action.color} text-white rounded-lg p-2 group-hover:scale-110 transition-transform duration-200`}>
                    <span className="material-symbols-outlined text-xl">
                      {action.icon}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                      {action.title}
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm">
                      {action.description}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-gray-400 group-hover:text-gray-600 transition-colors">
                    arrow_forward_ios
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            Recent Activity
          </h2>
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">
              timeline
            </span>
            <p className="text-gray-500 text-sm sm:text-base">
              No recent activity to display
            </p>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              Your recent actions will appear here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 