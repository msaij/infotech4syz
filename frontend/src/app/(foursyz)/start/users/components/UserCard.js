'use client'

export function UserCard({ user, onEdit, onView, onDelete, onManageRoles, hasEditPermission }) {
  const userData = user.user
  const userFoursyz = user

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-12 w-12">
            <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-lg font-medium text-gray-700">
                {userData.first_name?.[0]}{userData.last_name?.[0]}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">
              {userData.first_name} {userData.last_name}
            </h3>
            <p className="text-sm text-gray-500">@{userData.username}</p>
          </div>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          userFoursyz.is_active
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {userFoursyz.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <div>
          <p className="text-sm font-medium text-gray-700">Email</p>
          <p className="text-sm text-gray-900">{userData.email}</p>
        </div>
        
        <div>
          <p className="text-sm font-medium text-gray-700">Role</p>
          <p className="text-sm text-gray-900">{userFoursyz.role || 'No role assigned'}</p>
        </div>
        
        {userFoursyz.department && (
          <div>
            <p className="text-sm font-medium text-gray-700">Department</p>
            <p className="text-sm text-gray-900">{userFoursyz.department}</p>
          </div>
        )}
        
        {userFoursyz.position && (
          <div>
            <p className="text-sm font-medium text-gray-700">Position</p>
            <p className="text-sm text-gray-900">{userFoursyz.position}</p>
          </div>
        )}
        
        {userFoursyz.phone && (
          <div>
            <p className="text-sm font-medium text-gray-700">Phone</p>
            <p className="text-sm text-gray-900">{userFoursyz.phone}</p>
          </div>
        )}
        
        <div>
          <p className="text-sm font-medium text-gray-700">Roles & Permissions</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {userData.roles?.map(role => (
              <span
                key={role.id}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {role.name}
              </span>
            ))}
            {(!userData.roles || userData.roles.length === 0) && (
              <span className="text-xs text-gray-500">No roles assigned</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <button
            onClick={() => onView(user)}
            className="text-gray-600 hover:text-gray-900 p-1"
            title="View Details"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>
        
        {hasEditPermission && (
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(user)}
              className="text-blue-600 hover:text-blue-900 p-1"
              title="Edit User"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            
            <button
              onClick={() => onManageRoles(user)}
              className="text-purple-600 hover:text-purple-900 p-1"
              title="Manage Roles"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
            
            <button
              onClick={() => onDelete(user.id)}
              className="text-red-600 hover:text-red-900 p-1"
              title="Delete User"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 