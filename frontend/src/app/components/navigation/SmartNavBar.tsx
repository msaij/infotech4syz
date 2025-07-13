'use client';

import { useAuth } from "@/components/(access-providers)/auth-context";
import PublicNavBar from "@/components/PublicNavBar";
import CompanyNavBar from "@/start-components/CompanyNavBar";
import ClientNavBar from "@/client-components/ClientNavBar";
import LoadingPage from "@/components/LoadingPage";

export default function SmartNavBar() {
  const { user, loading, primaryGroup } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return <LoadingPage />;
  }

  // Show public navigation for unauthenticated users
  if (!user) {
    return <PublicNavBar />;
  }

  // Determine user type and show appropriate navigation
  const userType = primaryGroup();
  
  if (userType === "4syz") {
    return <CompanyNavBar user={user} />;
  } else {
    return <ClientNavBar user={user} />;
  }
} 