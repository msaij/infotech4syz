'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { AuthService } from '@/lib/api-service'

export default function LoginPage() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userType, setUserType] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const { login, isAuthenticated, isFoursyzUser, isClientUser } = useAuth()
  const router = useRouter()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (isFoursyzUser()) {
        router.push('/start/dashboard')
      } else if (isClientUser()) {
        router.push('/clients/dashboard')
      }
    }
  }, [isAuthenticated, isFoursyzUser, isClientUser, router])

  // Check for account lockout
  useEffect(() => {
    const lockoutTime = localStorage.getItem('login_lockout')
    if (lockoutTime) {
      const lockoutUntil = new Date(parseInt(lockoutTime))
      if (new Date() < lockoutUntil) {
        setIsLocked(true)
        const remainingTime = Math.ceil((lockoutUntil - new Date()) / 1000)
        const timer = setTimeout(() => {
          setIsLocked(false)
          localStorage.removeItem('login_lockout')
        }, remainingTime * 1000)
        return () => clearTimeout(timer)
      } else {
        localStorage.removeItem('login_lockout')
        setLoginAttempts(0)
      }
    }
  }, [])

  // Don't render the form if already authenticated
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    )
  }

  const detectUserType = (username) => {
    if (!username) return null
    
    // Check if it's an email
    if (username.includes('@')) {
      const domain = username.split('@')[1]?.toLowerCase()
      if (domain === '4syz.com') {
        return { type: '4syz User', domain: domain, color: 'blue' }
      }
      // For client users, we'll need to check against client domains
      return { type: 'Client User', domain: domain, color: 'green' }
    }
    
    // Check username patterns
    if (username.startsWith('4syz') || username.includes('admin')) {
      return { type: '4syz User', domain: '4syz.com', color: 'blue' }
    }
    
    return { type: 'Client User', domain: 'client.com', color: 'green' }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Detect user type based on username/email
    if (name === 'username') {
      const detected = detectUserType(value)
      setUserType(detected)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (isLocked) {
      setError('Account temporarily locked. Please try again later.')
      return
    }
    
    setLoading(true)
    setError('')

    try {
      const result = await login(credentials)
      
      if (result.success) {
        // Check user status and roles
        const userData = await AuthService.getMe()
        
        if (userData.error) {
          setError(userData.error)
          setLoading(false)
          return
        }
        
        // Validate user status
        if (!userData.is_active) {
          setError('Your account has been deactivated. Please contact your administrator.')
          setLoading(false)
          return
        }
        
        // Check if user has required roles
        if (!userData.role) {
          setError('Your account does not have the required permissions. Please contact your administrator.')
          setLoading(false)
          return
        }
        
        // Reset login attempts on successful login
        setLoginAttempts(0)
        localStorage.removeItem('login_lockout')
        
        // Navigation will be handled by the useEffect above
      } else {
        setError(result.error || 'Login failed')
        
        // Increment login attempts
        const newAttempts = loginAttempts + 1
        setLoginAttempts(newAttempts)
        
        // Lock account after 5 failed attempts
        if (newAttempts >= 5) {
          const lockoutTime = new Date().getTime() + (15 * 60 * 1000) // 15 minutes
          localStorage.setItem('login_lockout', lockoutTime.toString())
          setIsLocked(true)
          setError('Too many failed attempts. Account locked for 15 minutes.')
        }
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.')
      
      // Increment login attempts
      const newAttempts = loginAttempts + 1
      setLoginAttempts(newAttempts)
      
      if (newAttempts >= 5) {
        const lockoutTime = new Date().getTime() + (15 * 60 * 1000)
        localStorage.setItem('login_lockout', lockoutTime.toString())
        setIsLocked(true)
        setError('Too many failed attempts. Account locked for 15 minutes.')
      }
    } finally {
      setLoading(false)
    }
  }

  const getRemainingAttempts = () => {
    return Math.max(0, 5 - loginAttempts)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your account
          </p>
        </div>
        
        {/* User Type Indicator */}
        {userType && (
          <div className={`bg-${userType.color}-50 border border-${userType.color}-200 rounded-lg p-3`}>
            <div className="flex items-center">
              <div className={`flex-shrink-0 h-8 w-8 bg-${userType.color}-100 rounded-full flex items-center justify-center`}>
                <svg className={`h-4 w-4 text-${userType.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium text-${userType.color}-800`}>
                  {userType.type}
                </p>
                <p className={`text-xs text-${userType.color}-600`}>
                  Domain: {userType.domain}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username or Email
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                disabled={isLocked}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Enter your username or email"
                value={credentials.username}
                onChange={handleInputChange}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isLocked}
                  className="appearance-none relative block w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className={`h-5 w-5 ${showPassword ? 'text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Error Messages */}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Login Attempts Warning */}
          {loginAttempts > 0 && loginAttempts < 5 && (
            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-800">
                    {getRemainingAttempts()} login attempts remaining
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading || isLocked}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : isLocked ? (
                'Account Locked'
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          {/* Demo Credentials */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Demo Credentials</h3>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span className="font-medium">4syz Owner:</span>
                <span>msaij / msaij12345</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">4syz Admin:</span>
                <span>admin / admin123</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Client Admin:</span>
                <span>acmeuser / acmeuser123</span>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              This is a secure system. Unauthorized access attempts will be logged and reported.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
} 