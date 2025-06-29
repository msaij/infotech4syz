'use client';

import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/(access-providers)/auth-context";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#services", label: "Services" },
  { href: "/contact", label: "Contact", isexternal: true },
  { href: "/login", label: "Login" },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function NavBar() {
  const router = useRouter();
  const { user, logout, authFetch } = useAuth();
  const [csrfToken, setCsrfToken] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

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
    <nav className="w-full flex items-center justify-between px-8 py-4 bg-white shadow-sm sticky top-0 z-50">
      <div className="flex items-center gap-2 cursor-pointer select-none">
        <Link href="/" className="focus:outline-none">
          <span
            className="font-extrabold text-3xl tracking-widest text-black"
            style={{
              fontFamily: "'Montserrat', 'Geist', 'sans-serif'",
              letterSpacing: "0.15em",
            }}
          >
            4SYZ
          </span>
        </Link>
      </div>
      {user ? (
        <div className="flex items-center gap-4 relative">
          <Link href="/start/dashboard" className="font-medium">
            Dashboard
          </Link>
          <div
            className="relative"
            onMouseEnter={() => setMenuOpen(true)}
            onMouseLeave={() => setMenuOpen(false)}
          >
            <button
              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold"
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
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setMenuOpen(false)}
                >
                  View Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex gap-6 text-lg font-medium">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="">
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
