import { FoursyzNavBar } from './components/FoursyzNavBar'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function FoursyzLayout({ children }) {
  return (
    <ProtectedRoute userType="foursyz">
      <div className="min-h-screen bg-gray-50">
        <FoursyzNavBar />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
} 