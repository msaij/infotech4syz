"use client";
import ProtectedPage from "@/components/ProtectedPage";
import NavBar from "@/components/NavBar";

export default function StartLayout({ children }) {
  return (
    <ProtectedPage>
      <NavBar />
      {children}
    </ProtectedPage>
  );
}
