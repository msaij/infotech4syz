'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useNavigation } from '@/contexts/NavigationContext';
import { NavigationItem } from '@/config/navigation';
import { UserData } from '@/utils/auth';

interface NavigationLinkProps {
  item: NavigationItem & { hasAccess: boolean; loading: boolean; error?: string };
  isActive: boolean;
  onClick?: () => void;
  className?: string;
}

const NavigationLink: React.FC<NavigationLinkProps> = ({ item, isActive, onClick, className = '' }) => {
  const Icon = item.icon;
  
  if (!item.hasAccess) {
    return null;
  }

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`
        flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
        ${isActive 
          ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }
        ${item.loading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      aria-current={isActive ? 'page' : undefined}
      title={item.description}
    >
      <Icon />
      <span className="ml-3">{item.label}</span>
      {item.badge && (
        <span className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {item.badge}
        </span>
      )}
      {item.loading && (
        <div className="ml-auto animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
      )}
    </Link>
  );
};

interface UserMenuProps {
  user: UserData;
  onLogout: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { userMenuItems } = useNavigation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-3 py-2"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <span className="hidden md:block">{user.username}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
          <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
            <div className="font-medium">{user.username}</div>
            <div className="text-xs">{user.email}</div>
          </div>
          
          {userMenuItems.map(item => {
            if (!item.hasAccess) return null;
            
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={item.id === 'logout' ? handleLogout : undefined}
                className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
              >
                <Icon />
                <span className="ml-3">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface MobileMenuToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

const MobileMenuToggle: React.FC<MobileMenuToggleProps> = ({ isOpen, onToggle }) => (
  <button
    onClick={onToggle}
    className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
    aria-expanded={isOpen}
  >
    <span className="sr-only">Open main menu</span>
    {isOpen ? (
      <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ) : (
      <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    )}
  </button>
);

interface MobileNavigationProps {
  items: (NavigationItem & { hasAccess: boolean; loading: boolean; error?: string })[];
  onItemClick: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ items, onItemClick }) => (
  <div className="md:hidden">
    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
      {items.map(item => (
        <NavigationLink
          key={item.id}
          item={item}
          isActive={false}
          onClick={onItemClick}
          className="block w-full text-left"
        />
      ))}
    </div>
  </div>
);

interface NavigationSkeletonProps {
  count?: number;
}

const NavigationSkeleton: React.FC<NavigationSkeletonProps> = ({ count = 5 }) => (
  <div className="hidden md:flex items-center space-x-8">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </div>
    ))}
  </div>
);

interface DynamicNavigationProps {
  user: UserData;
  onLogout: () => void;
}

export const DynamicNavigation: React.FC<DynamicNavigationProps> = ({ user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { 
    navigationItems, 
    loading, 
    error, 
    currentPath 
  } = useNavigation();

  // Close mobile menu when path changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentPath]);

  if (loading) {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">FourSyz</h1>
            <NavigationSkeleton />
            <div className="animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  if (error) {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">FourSyz</h1>
            <div className="text-sm text-red-600">
              Navigation error: {error}
            </div>
            <UserMenu user={user} onLogout={onLogout} />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">FourSyz</h1>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map(item => (
              <NavigationLink
                key={item.id}
                item={item}
                isActive={currentPath === item.href}
              />
            ))}
          </div>
          
          {/* User Menu & Mobile Toggle */}
          <div className="flex items-center space-x-4">
            <UserMenu user={user} onLogout={onLogout} />
            <MobileMenuToggle 
              isOpen={isMobileMenuOpen} 
              onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            />
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <MobileNavigation 
            items={navigationItems} 
            onItemClick={() => setIsMobileMenuOpen(false)} 
          />
        )}
      </div>
    </nav>
  );
}; 