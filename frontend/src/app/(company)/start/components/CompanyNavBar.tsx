'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/components/access-providers/auth-context";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface CompanyNavBarProps {
  user: {
    email?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
    group_name?: string;
  };
}

export default function CompanyNavBar({ user }: CompanyNavBarProps) {
  const router = useRouter();
  const { logout, authFetch } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    try {
      // Get CSRF token
      const csrfRes = await authFetch(`${API_URL}/api/csrf/`);
      const { csrfToken } = await csrfRes.json();
      
      // Logout
      await authFetch(`${API_URL}/api/session-logout/`, {
        method: "POST",
        headers: { "X-CSRFToken": csrfToken },
      });
      
      logout();
      router.replace("/login");
    } catch (error) {
      console.error('Logout failed:', error);
      // Still logout locally even if server call fails
      logout();
      router.replace("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getUserInitial = () => {
    if (user.first_name) return user.first_name[0].toUpperCase();
    if (user.email) return user.email[0].toUpperCase();
    return "U";
  };

  return (
    <nav className="w-full flex items-center justify-between px-4 sm:px-8 py-4 bg-white shadow-sm border-b border-gray-200">
      {/* Company Branding */}
      <div className="flex items-center gap-4">
        <Link href="/start/dashboard" className="focus:outline-none">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xl tracking-widest text-black">
              {user.group_name?.toUpperCase()}
            </span>
            <span className="text-sm text-gray-500 font-medium">Company Dashboard</span>
          </div>
        </Link>
      </div>

      {/* Center Navigation */}
      <div className="hidden md:flex items-center gap-6">
        <Link
          href="/start/delivery-challan"
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition text-gray-700 font-medium"
        >
          <span className="material-symbols-outlined text-lg">local_shipping</span>
          <span>Delivery Challan</span>
        </Link>
      </div>

      {/* Right side - User menu */}
      <div className="flex items-center gap-4 relative">
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

        <div
          ref={menuRef}
          className="relative"
          onMouseEnter={() => setMenuOpen(true)}
          onMouseLeave={() => setMenuOpen(false)}
        >
          <button
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="button"
            aria-label="User menu"
            aria-expanded={menuOpen}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold">
              {getUserInitial()}
            </div>
            <span className="text-sm font-medium text-gray-700">
              {user.first_name && user.last_name 
                ? `${user.first_name} ${user.last_name}`
                : user.email || user.username
              }
            </span>
            <span className="material-symbols-outlined text-lg text-gray-500">
              expand_more
            </span>
          </button>
          {menuOpen && (
            <div 
              className="absolute right-0 top-full z-10 w-48 bg-white border rounded-lg shadow-lg text-black mt-1"
              role="menu"
              aria-label="User menu"
            >
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">
                  {user.first_name && user.last_name 
                    ? `${user.first_name} ${user.last_name}`
                    : user.email || user.username
                  }
                </p>
                <p className="text-xs text-gray-500">{user.group_name || "Company"}</p>
              </div>
              <Link
                href="/start/profile"
                className="block px-4 py-2 text-sm hover:bg-gray-100 transition"
                onClick={() => setMenuOpen(false)}
                role="menuitem"
              >
                View Profile
              </Link>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition disabled:opacity-50"
                role="menuitem"
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div 
          className="absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg md:hidden"
          role="menu"
          aria-label="Mobile navigation menu"
        >
          <div className="px-4 py-2 space-y-1">
            <div className="px-2 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">
                {user.first_name && user.last_name 
                  ? `${user.first_name} ${user.last_name}`
                  : user.email || user.username
                }
              </p>
              <p className="text-xs text-gray-500">{user.group_name || "Company"}</p>
            </div>
            <Link
              href="/start/delivery-challan"
              className="flex items-center gap-3 py-3 px-2 text-base font-medium hover:bg-gray-50 rounded transition"
              onClick={() => setMobileMenuOpen(false)}
              role="menuitem"
            >
              <span className="material-symbols-outlined text-xl">local_shipping</span>
              <span>Delivery Challan</span>
            </Link>
            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              disabled={isLoggingOut}
              className="flex items-center gap-3 w-full text-left py-3 px-2 text-base font-medium hover:bg-gray-50 rounded transition disabled:opacity-50"
              role="menuitem"
            >
              <span className="material-symbols-outlined text-xl">logout</span>
              <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
} 