'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return // Wait for auth to load

    if (!user) {
      // Not authenticated - redirect to login
      router.push('/login')
    } else {
      // Authenticated - redirect based on user type
      if (user.user_type === 'foursyz') {
        router.push('/start/dashboard')
      } else if (user.user_type === 'client') {
        router.push('/clients/dashboard')
      } else {
        // Fallback to login if user type is unknown
        router.push('/login')
      }
    }
  }, [user, loading, router])

  // Show loading while determining redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
} 