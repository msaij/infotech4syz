'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Roboto } from "next/font/google";
import React from "react";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["700"],
});

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const handleNav = (hash: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (pathname === "/") {
      window.location.hash = hash;
    } else {
      router.push(`/${hash}`);
    }
  };
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <a
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
        </a>
      </div>
      <div className="navbar-right">
        <a
          href="#about"
          className="navbar-link font-semibold rounded-md px-6 py-2 text-base transition bg-transparent hover:bg-gray-200 hover:text-black hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
          onClick={handleNav("#about")}
        >
          About Us
        </a>
        <a
          href="#services"
          className="navbar-link font-semibold rounded-md px-6 py-2 text-base transition bg-transparent hover:bg-gray-200 hover:text-black hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
          onClick={handleNav("#services")}
        >
          Services
        </a>
        <Link
          href="/home-navigation/contact-us"
          className="navbar-link font-semibold rounded-md px-6 py-2 text-base transition bg-transparent hover:bg-gray-200 hover:text-black hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
        >
          Contact Us
        </Link>
      </div>
    </nav>
  );
}
