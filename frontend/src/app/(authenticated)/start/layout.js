"use client";
import { useAuth } from "@/components/(access-providers)/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import NavBar from "@/components/NavBar";

export default function StartLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return null;
  }

  return (
    <>
      <NavBar />
      {children}
    </>
  );
}
