import Link from "next/link";
import { useRouter } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#services", label: "Services" },
  { href: "/contact", label: "Contact" },
  { href: "/login", label: "Login" },
];

export default function NavBar() {
  const router = useRouter();

  // Check for session data (simple localStorage/sessionStorage check for demo)
  const handleLogoClick = (e) => {
    if (typeof window !== "undefined") {
      const user = sessionStorage.getItem("user");
      if (user) {
        e.preventDefault();
        router.push("/");
      }
    }
  };

  return (
    <nav className="w-full flex items-center justify-between px-8 py-4 bg-white shadow-sm sticky top-0 z-50">
      <div className="flex items-center gap-2 cursor-pointer select-none">
        <Link href="/" onClick={handleLogoClick} className="focus:outline-none">
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
      <div className="flex gap-6 text-lg font-medium">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href} className="">
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
