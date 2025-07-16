"use client";

import { useAuth } from "@/components/access-providers/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingPage from "@/components/layout/LoadingPage";

interface RouteGuardProps {
  children: React.ReactNode;
  requiredGroup?: string | string[];
  redirectTo?: string;
  fallback?: React.ReactNode;
  userType?: "company" | "client" | "any";
}

export default function RouteGuard({ 
  children, 
  requiredGroup, 
  redirectTo = "/login",
  fallback = <LoadingPage />,
  userType
}: RouteGuardProps) {
  const { user, loading, inGroup } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace(redirectTo);
      } else if (requiredGroup && !inGroup(requiredGroup)) {
        // Redirect based on user type
        if (user.user_type === "company") {
          router.replace("/start/dashboard");
        } else {
          router.replace("/clients/dashboard");
        }
      } else if (userType) {
        // User type validation
        if (userType === "company" && user.user_type !== "company") {
          router.replace("/clients/dashboard");
        } else if (userType === "client" && user.user_type !== "client") {
          router.replace("/start/dashboard");
        }
      }
    }
  }, [user, loading, requiredGroup, inGroup, router, redirectTo, userType]);

  if (loading || !user || (requiredGroup && !inGroup(requiredGroup))) {
    return fallback;
  }

  return <>{children}</>;
} 