'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { RoleManager } from '@/foursyz/components/rbac/RoleManager'
import { UserRoleManager } from '@/foursyz/components/rbac/UserRoleManager'

export default function RbacManagementPage() {
  const { hasPermission, isOwner, isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState('roles') // 'roles' or 'assignments'

  if (!hasPermission('rbac.view_roles') && !isOwner() && !isAdmin()) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">You don&apos;t have permission to access RBAC management.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Role-Based Access Control</h1>
                <p className="text-gray-600 mt-1">
                  Manage user roles and permissions for the system
                </p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('roles')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'roles'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Roles Management
                </button>
                <button
                  onClick={() => setActiveTab('assignments')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'assignments'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  User Role Assignments
                </button>
              </nav>
            </div>
            
            <div className="p-6">
              {activeTab === 'roles' ? (
                <RoleManager />
              ) : (
                <UserRoleManager />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 