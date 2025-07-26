'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AuthService, UserData } from '@/utils/auth'
import { ClientService } from '@/utils/clientService'
import DeliveryChallanService from '@/utils/deliveryChallanService'
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
      
      // Check role-based access for specific routes
      if (pathname === env.ROUTES.CLIENT_DETAILS) {
        if (!ClientService.isCEOUser(userData)) {
          // Non-CEO users trying to access client_details should be redirected
          router.push(env.ROUTES.DASHBOARD)
          setIsLoading(false)
          return
        }
      }
      
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

  useEffect(() => {
    validateUser()
  }, [pathname]) // Removed router from dependencies to prevent unnecessary re-runs

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

  // For non-CEO users trying to access client_details, don't render anything
  if (pathname === env.ROUTES.CLIENT_DETAILS && userData && !ClientService.isCEOUser(userData)) {
    return null
  }

  // Show children if user is valid or on login page
  if (isValidUser || pathname === env.ROUTES.LOGIN) {
    return <>{children}</>
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