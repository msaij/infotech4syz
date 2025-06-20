"use client";
import ProtectedPage from "@/components/ProtectedPage";

export default function StartLayout({ children }) {
  return <ProtectedPage>{children}</ProtectedPage>;
}
