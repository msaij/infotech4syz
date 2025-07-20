'use client'

import { ClientList } from './components/ClientList'
import { PermissionGate } from '@/components/auth/PermissionGate'

export default function ClientsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ClientList />
      </div>
    </div>
  )
} 