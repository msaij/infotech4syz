"use client";
import { useAuth } from "@/components/(access-providers)/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingPage from "@/components/LoadingPage";

export default function ClientsLayout({ children }) {
  const { user, loading, primaryGroup } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
      } else if (primaryGroup() === "4syz") {
        // 4syz user, redirect to company dashboard
        router.replace("/start/dashboard");
      }
    }
  }, [user, loading, primaryGroup, router]);

  if (loading || !user || primaryGroup() === "4syz") {
    return <LoadingPage />;
  }

  return (
    <div className="flex h-screen">
      <main className="flex-1 overflow-auto relative">
        {children}
      </main>
    </div>
  );
} 