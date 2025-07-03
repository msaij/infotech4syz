// Dashboard page for authenticated users
// Redirects to login if not authenticated, shows user info if logged in
"use client";

import { useAuth } from "@/components/(access-providers)/auth-context";
import LoadingPage from "@/components/LoadingPage";

export default function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    // Show loading spinner while checking authentication
    return <LoadingPage />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <h1 className="text-4xl font-bold mb-4">Welcome to your Dashboard!</h1>
      <div className="text-lg text-gray-700">
        Logged in as:{" "}
        {user && (
          <span className="font-semibold">{user.email || user.username}</span>
        )}
      </div>
    </div>
  );
}
