import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#services", label: "Services" },
  { href: "/contact", label: "Contact" },
  { href: "/login", label: "Login" },
];

export default function NavBar() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [csrfToken, setCsrfToken] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/users/me/`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data))
      .catch(() => {});
    fetch(`${API_BASE_URL}/api/csrf/`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setCsrfToken(data.csrfToken))
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch(`${API_BASE_URL}/api/logout/`, {
      method: "POST",
      headers: { "X-CSRFToken": csrfToken },
      credentials: "include",
    });
    router.push("/login");
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
          <button
            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {user.email ? user.email[0].toUpperCase() : "U"}
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-md text-black">
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
