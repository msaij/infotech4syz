'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AuthService, UserData } from '@/utils/auth'
import { NavigationProvider } from '@/contexts/NavigationContext'
import { DynamicNavigation } from '@/components/navigation/DynamicNavigation'
import { NavigationErrorBoundary } from '@/components/navigation/NavigationErrorBoundary'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import { env } from '@/config/env'

export default function FourSyzLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [isValidUser, setIsValidUser] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)

  const validateUser = async () => {
    const token = AuthService.getStoredToken(env.STORAGE_KEYS.ACCESS_TOKEN)
    
    // If no token and not on login page, redirect to login
    if (!token) {
      if (pathname !== env.ROUTES.LOGIN) {
        router.push(env.ROUTES.LOGIN)
      }
      setIsLoading(false)
      return
    }

    // Try to validate current token
    let userData = await AuthService.validateUser(token)

    // If token expired, try to refresh
    if (!userData) {
      const refreshToken = AuthService.getStoredToken(env.STORAGE_KEYS.REFRESH_TOKEN)
      if (refreshToken) {
        const newToken = await AuthService.refreshToken(refreshToken)
        if (newToken) {
          AuthService.setStoredToken(env.STORAGE_KEYS.ACCESS_TOKEN, newToken)
          userData = await AuthService.validateUser(newToken)
        }
      }
    }

    // Handle validation result
    if (userData && AuthService.isValidUser(userData)) {
      setIsValidUser(true)
      setUserData(userData)
      
      // If on login page and valid user, redirect to dashboard
      if (pathname === env.ROUTES.LOGIN) {
        router.push(env.ROUTES.DASHBOARD)
      }
    } else {
      // User not valid or not in users_4syz collection
      AuthService.clearAuthTokens()
      if (pathname !== env.ROUTES.LOGIN) {
        router.push(env.ROUTES.LOGIN)
      }
    }
    
    setIsLoading(false)
  }

  const handleLogout = async () => {
    try {
      const token = AuthService.getStoredToken(env.STORAGE_KEYS.ACCESS_TOKEN)
      if (token) {
        // Call logout endpoint to blacklist token
        await fetch(`${env.API_BASE_URL}${env.API_ENDPOINTS.AUTH_ENDPOINTS.LOGOUT}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      }
    } catch (error) {
      console.error('Logout API call failed:', error)
    } finally {
      // Clear all auth data
      AuthService.clearAuthTokens()
      localStorage.removeItem('user')
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('tokenExpiration')
      
      router.push(env.ROUTES.LOGIN)
    }
  }

  useEffect(() => {
    validateUser()
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  // Show loading while validating
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Validating authentication...</p>
        </div>
      </div>
    )
  }

  // Show children if user is valid or on login page
  if (isValidUser || pathname === env.ROUTES.LOGIN) {
    return (
      <NavigationProvider user={userData}>
        {pathname === env.ROUTES.LOGIN ? (
          <>{children}</>
        ) : (
          <NavigationErrorBoundary user={userData!} onLogout={handleLogout}>
            <div className="min-h-screen bg-gray-50">
              <DynamicNavigation 
                user={userData!} 
                onLogout={handleLogout} 
              />
              <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                  <Breadcrumbs />
                  {children}
                </div>
              </main>
            </div>
          </NavigationErrorBoundary>
        )}
      </NavigationProvider>
    )
  }

  // Fallback loading state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
}