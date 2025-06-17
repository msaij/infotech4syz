"use client";

import { Roboto } from "next/font/google";
import '@/styles/home-page.css';
import Link from "next/link";
import React, { useState, useEffect } from "react";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["700"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Navbar as a client component
  function Navbar() {
    return (
      <nav className="navbar">
        {/* Left section of the navbar: Logo */}
        <div className="navbar-left">
          <Link
            href="/"
            className="navbar-logo"
            style={{
              fontFamily: roboto.style.fontFamily,
              fontWeight: 700,
              fontSize: "1.6rem",
              letterSpacing: "0.08em",
              color: "#222",
              textDecoration: "none",
              background: "none",
              padding: 0,
            }}
          >
            4SYZ
          </Link>
        </div>
        {/* Right section of the navbar: Navigation links */}
        <div className="navbar-right">
          {/* Link to the About Us section */}
          <Link href="/#about"
            className="navbar-link font-semibold rounded-md px-6 py-2 text-base transition bg-transparent hover:bg-gray-200 hover:text-black hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-black">
            About Us
          </Link>

          {/* Link to the Services section */}
          <Link href="/#services"
            className="navbar-link font-semibold rounded-md px-6 py-2 text-base transition bg-transparent hover:bg-gray-200 hover:text-black hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-black">
            Services
          </Link>

          {/* Link to the Contact Us page */}
          <a href="/contact-us"
            className="navbar-link font-semibold rounded-md px-6 py-2 text-base transition bg-transparent hover:bg-gray-200 hover:text-black hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-black">
            Contact Us
          </a>

          {/* Link to the Login page */}
          <Link href="/login"
            className="navbar-link font-semibold rounded-md px-6 py-2 text-base transition bg-transparent hover:bg-black hover:text-white hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-black">
            Login
          </Link>
        </div>
      </nav>
    );
  }

  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <html lang="en">
      <body className="antialiased">
        {/* Google Material Symbols font for icons */}
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,1,0" rel="stylesheet" />
        {/* Render the Navbar component */}
        <Navbar />
        {/* Render the main content of the page */}
        {children}
        {/* Footer section */}
        <footer className="w-full border-t bg-gray-50 text-gray-500 text-xs text-center py-2 mt-1">
          &copy; {currentYear} 4syz infotech solutions private limited. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
