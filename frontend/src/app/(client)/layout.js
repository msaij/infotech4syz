import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { ClientNavBar } from './clients/components/ClientNavBar'

export default function ClientLayout({ children }) {
  return (
    <ProtectedRoute userType="client">
      <div className="min-h-screen bg-gray-50">
        <ClientNavBar />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
} 