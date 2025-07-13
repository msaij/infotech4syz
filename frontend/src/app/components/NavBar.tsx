'use client';

import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/(access-providers)/auth-context";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#services", label: "Services" },
  { href: "/explore", label: "Explore" }, // Added link
  { href: "/contact", label: "Contact", isexternal: true },
  { href: "/login", label: "Login" },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function NavBar() {
  const router = useRouter();
  const { user, logout, authFetch } = useAuth();
  const [csrfToken, setCsrfToken] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    authFetch(`${API_URL}/api/csrf/`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setCsrfToken(data.csrfToken))
      .catch(() => {});
  }, [authFetch]);

  const handleLogout = async () => {
    await authFetch(`${API_URL}/api/session-logout/`, {
      method: "POST",
      headers: { "X-CSRFToken": csrfToken },
      credentials: "include",
    });
    logout(); // clear global auth state
    redirect("/login"); // Redirect to login page
  };

  return (
    <nav className="w-full flex items-center justify-between px-4 sm:px-8 py-4 bg-white shadow-sm sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2 cursor-pointer select-none">
        <Link href="/" className="focus:outline-none">
          <span
            className="font-extrabold text-2xl sm:text-3xl tracking-widest text-black"
            style={{
              fontFamily: "var(--font-montserrat), var(--font-geist-sans), sans-serif",
              letterSpacing: "0.15em",
            }}
          >
            4SYZ
          </span>
        </Link>
      </div>

      {/* Desktop Navigation */}
      {user ? (
        <div className="hidden md:flex items-center gap-4 relative">
          <Link href="/start/dashboard" className="font-medium hover:text-gray-600 transition">
            Dashboard
          </Link>
          <div
            className="relative"
            onMouseEnter={() => setMenuOpen(true)}
            onMouseLeave={() => setMenuOpen(false)}
          >
            <button
              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold hover:bg-gray-300 transition"
              type="button"
              tabIndex={0}
              aria-label="Profile menu"
            >
              {user.email ? user.email[0].toUpperCase() : "U"}
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full z-10 w-40 bg-white border rounded shadow-md text-black">
                <Link
                  href="/start/profile"
                  className="block px-4 py-2 hover:bg-gray-100 transition"
                  onClick={() => setMenuOpen(false)}
                >
                  View Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="hidden md:flex gap-4 lg:gap-6 text-base lg:text-lg font-medium">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className="hover:text-gray-600 transition"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center gap-2">
        {user && (
          <Link href="/start/dashboard" className="text-sm font-medium mr-2">
            Dashboard
          </Link>
        )}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-md hover:bg-gray-100 transition"
          aria-label="Toggle mobile menu"
        >
          <span className="material-symbols-outlined text-2xl">
            {mobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg md:hidden">
          <div className="px-4 py-2 space-y-1">
            {!user ? (
              navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block py-3 px-2 text-base font-medium hover:bg-gray-50 rounded transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))
            ) : (
              <div className="space-y-1">
                <Link
                  href="/start/profile"
                  className="block py-3 px-2 text-base font-medium hover:bg-gray-50 rounded transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  View Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-3 px-2 text-base font-medium hover:bg-gray-50 rounded transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
