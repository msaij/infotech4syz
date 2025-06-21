"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ProtectedPage({ children }) {
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const res = await fetch(`${API_BASE_URL}/api/users/me/`, {
        credentials: "include",
      });
      if (!res.ok) {
        router.replace("/login");
      }
    }
    checkAuth();
  }, [router]);

  return children;
}
