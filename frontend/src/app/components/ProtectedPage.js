"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedPage({ children }) {
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const res = await fetch("http://127.0.0.1:8000/api/users/", {
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
