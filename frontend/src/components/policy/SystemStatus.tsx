'use client'

import { ResourcePermission, UserResourceAssignment } from '@/utils/resourcePermissionService'
import { UserData } from '@/utils/auth'

interface SystemStatusProps {
  permissions: ResourcePermission[]
  assignments: UserResourceAssignment[]
  users: UserData[]
}

export default function SystemStatus({ permissions, assignments, users }: SystemStatusProps) {
  // Calculate statistics
  const totalPermissions = permissions.length
  const totalAssignments = assignments.length
  const totalUsers = users.length
  const activeAssignments = assignments.filter(a => a.active).length

  // Group permissions by category
  const permissionsByCategory = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = 0
    }
    acc[permission.category]++
    return acc
  }, {} as Record<string, number>)

  // Group assignments by user
  const assignmentsByUser = assignments.reduce((acc, assignment) => {
    if (!acc[assignment.user_id]) {
      acc[assignment.user_id] = 0
    }
    acc[assignment.user_id]++
    return acc
  }, {} as Record<string, number>)

  const usersWithAssignments = Object.keys(assignmentsByUser).length

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Resource Permission System Status</h3>
        </div>

        <div className="flex items-center space-x-3 mb-4">
          <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-green-600 bg-green-100">
              HEALTHY
            </span>
            <p className="text-sm text-gray-600 mt-1">
              Resource permission system is operational
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Permissions</p>
              <p className="text-2xl font-semibold text-gray-900">{totalPermissions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Assignments</p>
              <p className="text-2xl font-semibold text-gray-900">{totalAssignments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Assignments</p>
              <p className="text-2xl font-semibold text-gray-900">{activeAssignments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{totalUsers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Permissions by Category */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Permissions by Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(permissionsByCategory).map(([category, count]) => (
            <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-900">{category}</span>
              <span className="text-sm text-gray-500">{count} permissions</span>
            </div>
          ))}
        </div>
      </div>

      {/* User Assignment Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">User Assignment Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900">Users with Assignments</p>
            <p className="text-2xl font-semibold text-blue-700">{usersWithAssignments}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm font-medium text-green-900">Active Assignments</p>
            <p className="text-2xl font-semibold text-green-700">{activeAssignments}</p>
          </div>
        </div>
      </div>
    </div>
  )
} 