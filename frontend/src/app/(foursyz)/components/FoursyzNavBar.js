'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { PermissionGate } from '@/components/auth/PermissionGate'
import { useState, useEffect, useRef } from 'react'

export function FoursyzNavBar() {
  const pathname = usePathname()
  const { logout, isOwner, isAdmin, hasPermission, user } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [foursyzDropdownOpen, setFoursyzDropdownOpen] = useState(false)
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  
  const foursyzDropdownRef = useRef(null)
  const clientDropdownRef = useRef(null)
  const userDropdownRef = useRef(null)

  // Define navigation items with role-based access
  const navItems = [
    { 
      href: '/start/dashboard', 
      label: 'Dashboard',
      icon: '📊',
      alwaysVisible: true,
      type: 'standalone'
    },
    { 
      href: '/start/analytics', 
      label: 'Analytics',
      icon: '📈',
      permissions: ['clients.view_clients'],
      roles: ['4syz Owner', '4syz Admin'],
      type: 'standalone',
      description: 'View system analytics and reports'
    },
  ]

  // 4syz Management dropdown items
  const foursyzManagementItems = [
    { 
      href: '/start/users', 
      label: 'Users',
      icon: '👥',
      permissions: ['users.view_users'],
      roles: ['4syz Owner', '4syz Admin'],
      description: 'Manage 4syz users and their roles'
    },
    { 
      href: '/start/4syz-management/roles', 
      label: 'Role Management',
      icon: '🔐',
      roles: ['4syz Owner', '4syz Admin'],
      description: 'Manage roles and user assignments'
    },
    { 
      href: '/start/permissions', 
      label: 'System Permissions',
      icon: '📋',
      roles: ['4syz Owner'],
      description: 'View system permissions'
    },
  ]

  // User dropdown items
  const userDropdownItems = [
    { 
      href: '/start/profile', 
      label: 'Profile',
      icon: '👤',
      alwaysVisible: true,
      description: 'Manage your profile and settings'
    },
    { 
      href: '/start/queries', 
      label: 'My Queries',
      icon: '❓',
      permissions: ['queries.view_queries'],
      description: 'View and manage your support queries'
    },
  ]

  // Client Management dropdown items
  const clientManagementItems = [
    { 
      href: '/start/clients', 
      label: 'Clients',
      icon: '🏢',
      permissions: ['clients.view_clients'],
      roles: ['4syz Owner', '4syz Admin'],
      description: 'Manage client companies and their information'
    },
    { 
      href: '/start/client-management/users', 
      label: 'Client Users',
      icon: '👥',
      permissions: ['clients.view_clients'],
      roles: ['4syz Owner', '4syz Admin'],
      description: 'Manage users within client companies'
    },
    { 
      href: '/start/client-management/analytics', 
      label: 'Client Analytics',
      icon: '📊',
      permissions: ['clients.view_clients'],
      roles: ['4syz Owner', '4syz Admin'],
      description: 'View analytics specific to clients'
    },
  ]

  const canAccessItem = (item) => {
    // Always visible items
    if (item.alwaysVisible) return true
    
    // Owner can access everything
    if (isOwner()) return true
    
    // Check role-based access
    if (item.roles && item.roles.length > 0) {
      if (isAdmin() && item.roles.includes('4syz Admin')) return true
      if (isOwner() && item.roles.includes('4syz Owner')) return true
    }
    
    // Check permission-based access
    if (item.permissions && item.permissions.length > 0) {
      return item.permissions.some(permission => hasPermission(permission))
    }
    
    return false
  }

  const filteredNavItems = navItems.filter(canAccessItem)
  const filteredFoursyzItems = foursyzManagementItems.filter(canAccessItem)
  const filteredClientItems = clientManagementItems.filter(canAccessItem)
  const filteredUserItems = userDropdownItems.filter(canAccessItem)

  // Handle click outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (foursyzDropdownRef.current && !foursyzDropdownRef.current.contains(event.target)) {
        setFoursyzDropdownOpen(false)
      }
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target)) {
        setClientDropdownOpen(false)
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const isActive = (href) => {
    if (href === '/start/dashboard') {
      return pathname === href
    }
    if (href === '/start/profile') {
      return pathname === href
    }
    if (href === '/start/queries') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const DropdownItem = ({ item, onClick }) => (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
        isActive(item.href)
          ? 'text-blue-600 bg-blue-50 border-r-2 border-blue-500'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
      title={item.description}
    >
      <span className="text-lg">{item.icon}</span>
      <div className="flex flex-col">
        <span>{item.label}</span>
        {item.description && (
          <span className="text-xs text-gray-500">{item.description}</span>
        )}
      </div>
    </Link>
  )

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/start/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">4</span>
              </div>
              <span className="text-xl font-bold text-gray-800">4syz Admin</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Standalone Navigation Items */}
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'text-blue-600 bg-blue-50 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                title={item.description}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}

            {/* 4syz Management Dropdown */}
            {filteredFoursyzItems.length > 0 && (
              <div className="relative" ref={foursyzDropdownRef}>
                <button
                  onClick={() => setFoursyzDropdownOpen(!foursyzDropdownOpen)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    pathname.startsWith('/start/users') || pathname.startsWith('/start/permissions')
                      ? 'text-blue-600 bg-blue-50 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span>⚙️</span>
                  <span>4syz Management</span>
                  <svg className={`w-4 h-4 transition-transform duration-200 ${foursyzDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {foursyzDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="py-2">
                      {filteredFoursyzItems.map((item) => (
                        <DropdownItem 
                          key={item.href} 
                          item={item} 
                          onClick={() => setFoursyzDropdownOpen(false)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Client Management Dropdown */}
            {filteredClientItems.length > 0 && (
              <div className="relative" ref={clientDropdownRef}>
                <button
                  onClick={() => setClientDropdownOpen(!clientDropdownOpen)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    pathname.startsWith('/start/clients') || pathname.startsWith('/start/client-management')
                      ? 'text-blue-600 bg-blue-50 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span>🏢</span>
                  <span>Client Management</span>
                  <svg className={`w-4 h-4 transition-transform duration-200 ${clientDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {clientDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="py-2">
                      {filteredClientItems.map((item) => (
                        <DropdownItem 
                          key={item.href} 
                          item={item} 
                          onClick={() => setClientDropdownOpen(false)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Menu and Logout */}
          <div className="flex items-center space-x-4">
            {/* User Dropdown */}
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  pathname === '/start/profile' || pathname === '/start/queries'
                    ? 'text-blue-600 bg-blue-50 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">
                    {user?.first_name?.[0]}{user?.last_name?.[0] || user?.username?.[0]}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <div className="font-medium text-gray-900">{user?.first_name || user?.username}</div>
                  <div className="text-xs text-gray-500 capitalize">{user?.user_type || 'User'}</div>
                </div>
                <svg className={`w-4 h-4 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {userDropdownOpen && (
                <div className="absolute top-full right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="py-2">
                    {filteredUserItems.map((item) => (
                      <DropdownItem 
                        key={item.href} 
                        item={item} 
                        onClick={() => setUserDropdownOpen(false)}
                      />
                    ))}
                    
                    {/* Divider */}
                    <div className="border-t border-gray-200 my-2"></div>
                    
                    {/* Logout Button */}
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false)
                        logout()
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-200"
                    >
                      <span>🚪</span>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-2">
              {/* Standalone Navigation Items */}
              {filteredNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'text-blue-600 bg-blue-50 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <div className="flex flex-col">
                    <span>{item.label}</span>
                    {item.description && (
                      <span className="text-xs text-gray-500">{item.description}</span>
                    )}
                  </div>
                </Link>
              ))}

              {/* 4syz Management Section */}
              {filteredFoursyzItems.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    4syz Management
                  </div>
                  {filteredFoursyzItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        isActive(item.href)
                          ? 'text-blue-600 bg-blue-50 border border-blue-200'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <div className="flex flex-col">
                        <span>{item.label}</span>
                        {item.description && (
                          <span className="text-xs text-gray-500">{item.description}</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Client Management Section */}
              {filteredClientItems.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Client Management
                  </div>
                  {filteredClientItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        isActive(item.href)
                          ? 'text-blue-600 bg-blue-50 border border-blue-200'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <div className="flex flex-col">
                        <span>{item.label}</span>
                        {item.description && (
                          <span className="text-xs text-gray-500">{item.description}</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              
              {/* User Section in Mobile */}
              <div className="border-t border-gray-200 pt-4">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  User Menu
                </div>
                {filteredUserItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      isActive(item.href)
                        ? 'text-blue-600 bg-blue-50 border border-blue-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <div className="flex flex-col">
                      <span>{item.label}</span>
                      {item.description && (
                        <span className="text-xs text-gray-500">{item.description}</span>
                      )}
                    </div>
                  </Link>
                ))}
                
                {/* Logout in Mobile */}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    logout()
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-200"
                >
                  <span className="text-lg">🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
} 