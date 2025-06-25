"use client";
import { useAuth } from "@/components/(access-providers)/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import NavBar from "@/components/NavBar";
import LoadingPage from "@/components/LoadingPage";
import AuthNav from "@/authenticated-components/AuthNav";

export default function StartLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <LoadingPage />;
  }

  return (
    <div className="flex h-screen">
      <AuthNav />
      <div className="flex-1 flex flex-col min-w-0">
        <NavBar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
