"use client";
import RouteGuard from "@/components/layout/RouteGuard";
import CompanyNavBar from "./components/CompanyNavBar";
import { PWAStatus } from "@/components/pwa";
import { useAuth } from "@/components/access-providers/auth-context";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function StartLayout({ children }) {
  const { user } = useAuth();
  const [queryClient] = useState(() => new QueryClient());
  
  return (
    <QueryClientProvider client={queryClient}>
      <RouteGuard requiredGroup="company" userType="company">
        <div className="flex flex-col h-screen">
          <CompanyNavBar user={user} />
          <main className="flex-1 overflow-auto relative">
            {children}
            <PWAStatus />
          </main>
        </div>
      </RouteGuard>
    </QueryClientProvider>
  );
}
