"use client";
import { useAuth } from "@/components/(access-providers)/auth-context";
import { useState } from "react";

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    username: user?.username || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement profile update logic
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Profile
            </h1>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-black text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-800 transition text-sm"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Profile Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl sm:text-3xl text-gray-500">
                  person
                </span>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                  {user?.first_name && user?.last_name 
                    ? `${user.first_name} ${user.last_name}`
                    : user?.username || 'User'
                  }
                </h2>
                <p className="text-gray-600 text-sm sm:text-base">
                  {user?.email || 'No email provided'}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    disabled={!isEditing}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    disabled={!isEditing}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  disabled={!isEditing}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  disabled={!isEditing}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>

              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Account Settings */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Account Settings
            </h3>
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-gray-500">
                    lock
                  </span>
                  <span className="text-sm font-medium text-gray-700">Change Password</span>
                </div>
                <span className="material-symbols-outlined text-gray-400">
                  arrow_forward_ios
                </span>
              </button>
              
              <button className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-gray-500">
                    notifications
                  </span>
                  <span className="text-sm font-medium text-gray-700">Notification Settings</span>
                </div>
                <span className="material-symbols-outlined text-gray-400">
                  arrow_forward_ios
                </span>
              </button>
              
              <button className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-gray-500">
                    security
                  </span>
                  <span className="text-sm font-medium text-gray-700">Privacy Settings</span>
                </div>
                <span className="material-symbols-outlined text-gray-400">
                  arrow_forward_ios
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
