"use client";
import RouteGuard from "@/components/RouteGuard";
import CompanyNavBar from "@/start-components/CompanyNavBar";
import { PWAStatus } from "@/components/pwa";
import { useAuth } from "@/components/(access-providers)/auth-context";

export default function StartLayout({ children }) {
  const { user } = useAuth();
  
  return (
    <RouteGuard requiredGroup="4syz" userType="company">
      <div className="flex flex-col h-screen">
        <CompanyNavBar user={user} />
        <main className="flex-1 overflow-auto relative">
          {children}
          <PWAStatus />
        </main>
      </div>
    </RouteGuard>
  );
}
