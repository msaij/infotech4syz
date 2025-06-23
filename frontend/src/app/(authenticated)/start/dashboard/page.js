// Dashboard page for authenticated users
"use client";

import { useAuth } from "@/components/(access-providers)/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return null; // Wait for auth state to resolve before rendering
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <h1 className="text-4xl font-bold mb-4">Welcome to your Dashboard!</h1>
      <div className="text-lg text-gray-700">
        Logged in as:{" "}
        <span className="font-semibold">{user.email || user.username}</span>
      </div>
    </div>
  );
}
