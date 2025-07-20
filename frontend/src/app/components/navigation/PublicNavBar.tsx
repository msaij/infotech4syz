'use client';

import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#services", label: "Services" },
  { href: "/explore", label: "Explore" },
  { href: "/contact", label: "Contact" },
  { href: "/login", label: "Login" },
];

export default function PublicNavBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="w-full flex items-center justify-between px-4 sm:px-8 py-4 bg-white shadow-sm sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2 cursor-pointer select-none">
        <Link href="/" className="focus:outline-none">
          <span
            className="font-extrabold text-2xl sm:text-3xl tracking-widest text-black"
            style={{
              fontFamily: 'Montserrat, Inter, Arial, sans-serif',
              letterSpacing: '0.05em',
            }}
          >
            4SYZ
          </span>
        </Link>
      </div>

      {/* Desktop Navigation */}
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

      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center gap-2">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-md hover:bg-gray-100 transition"
          aria-label="Toggle mobile menu"
          aria-expanded={mobileMenuOpen}
        >
          <span className="material-symbols-outlined text-2xl">
            {mobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div 
          className="absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg md:hidden"
          role="menu"
          aria-label="Mobile navigation menu"
        >
          <div className="px-4 py-2 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-3 px-2 text-base font-medium hover:bg-gray-50 rounded transition"
                onClick={() => setMobileMenuOpen(false)}
                role="menuitem"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
} 