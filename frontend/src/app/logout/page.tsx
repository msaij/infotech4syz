"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/access-providers/auth-context";

export default function LogoutPage() {
  const router = useRouter();
  const { logout, user, primaryGroup } = useAuth();

  // Handle logout: clear user context and redirect
  useEffect(() => {
    logout(); // Clear JWT tokens and user context
    
    // Redirect based on user type
    const userType = primaryGroup();
    if (userType === "company") {
      router.replace("/login");
    } else if (userType === "client") {
      router.replace("/login");
    } else {
      router.replace("/login");
    }
  }, [logout, router, primaryGroup]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black py-16 px-4">
      <div className="w-full max-w-md bg-gray-100 p-8 rounded-lg shadow text-center">
        <h1 className="text-3xl font-bold mb-6">Logging Out...</h1>
        <p className="text-gray-600">Please wait while we sign you out.</p>
      </div>
    </div>
  );
}
