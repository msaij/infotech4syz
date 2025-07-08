"use client";
import { useAuth } from "@/components/(access-providers)/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import NavBar from "@/components/NavBar";
import LoadingPage from "@/components/LoadingPage";
import AuthNav from "@/start-components/AuthNav";
import { PWAStatus } from "@/components/pwa";

export default function StartLayout({ children }) {
  const { user, loading, primaryGroup } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
      } else if (primaryGroup() !== "4syz") {
        // Not a 4syz user, redirect to client dashboard
        router.replace("/client/dashboard");
      }
    }
  }, [user, loading, primaryGroup, router]);

  if (loading || !user || primaryGroup() !== "4syz") {
    return <LoadingPage />;
  }

  return (
    <div className="flex h-screen">
      <AuthNav />
      <div className="flex-1 flex flex-col min-w-0">
        <NavBar />
        <main className="flex-1 overflow-auto relative">
          {children}
          <PWAStatus />
        </main>
      </div>
    </div>
  );
}
