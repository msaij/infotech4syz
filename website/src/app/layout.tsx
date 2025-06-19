import "./globals.css";
import React from "react";
import Navbar from "../components/Navbar";

export { metadata } from "./layout-metadata";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {/* Google Material Symbols font for icons */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,1,0"
          rel="stylesheet"
        />
        <Navbar />
        {children}
        <footer className="w-full border-t bg-gray-50 text-gray-500 text-xs text-center py-2 mt-8">
          &copy; {new Date().getFullYear()} 4syz infotech solutions private limited. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
