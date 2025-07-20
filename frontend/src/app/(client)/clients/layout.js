"use client";
import RouteGuard from "@/components/layout/RouteGuard";
import ClientNavBar from "@/client-components/ClientNavBar";
import { useAuth } from "@/components/access-providers/auth-context";

export default function ClientsLayout({ children }) {
  const { user } = useAuth();
  
  return (
    <RouteGuard 
      userType="client"
      fallback={<div>Access Denied</div>}
    >
      <div className="flex flex-col h-screen">
        <ClientNavBar user={user} />
        <main className="flex-1 overflow-auto relative">
          {children}
        </main>
      </div>
    </RouteGuard>
  );
} 