"use client";

import { ReactNode } from "react";
import { AuthProvider } from "../access-providers/auth-context";
import { PWAInstallPrompt, ServiceWorkerRegistration } from "../pwa";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <AuthProvider>
      {children}
      <PWAInstallPrompt />
      <ServiceWorkerRegistration />
    </AuthProvider>
  );
} 