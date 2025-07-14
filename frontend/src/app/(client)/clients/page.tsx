"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingPage from "@/components/LoadingPage";

export default function ClientsRoot() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/clients/dashboard");
  }, [router]);
  return <LoadingPage />;
} 