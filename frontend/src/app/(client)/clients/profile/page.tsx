"use client";

import { useAuth } from "@/components/access-providers/auth-context";
import LoadingPage from "@/components/layout/LoadingPage";
import { useState, useEffect } from "react";

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phone?: string;
  department?: string;
  position?: string;
}

export default function ClientProfile() {
  const { user, authFetch } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    phone: '',
    department: '',
    position: ''
  });

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        username: user.username || '',
        phone: user.phone || '',
        department: user.department || '',
        position: user.position || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Get the current user profile ID
      const response = await authFetch('/api/v1/client/users/');
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userData = await response.json();
      if (!userData.results || userData.results.length === 0) {
        throw new Error('No user profile found');
      }

      const userProfile = userData.results[0];
      
      // Update the user profile
      const updateResponse = await authFetch(`/api/v1/client/users/${userProfile.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            username: formData.username
          },
          phone: formData.phone,
          department: formData.department,
          position: formData.position
        }),
      });

      if (updateResponse.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
        // Refresh the page to get updated user data
        window.location.reload();
      } else {
        const errorData = await updateResponse.json();
        throw new Error(errorData.detail || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update profile' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original user data
    if (user) {
      setFormData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        username: user.username || '',
        phone: user.phone || '',
        department: user.department || '',
        position: user.position || ''
      });
    }
    setIsEditing(false);
    setMessage(null);
  };

  if (!user) {
    return <LoadingPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Profile
              </h1>
              <p className="mt-1 text-sm sm:text-base text-gray-600">
                Manage your account information
              </p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              disabled={loading}
              className="mt-4 sm:mt-0 bg-black text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-800 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          {/* Profile Header */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl sm:text-3xl text-gray-500">
                  person
                </span>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                  {user.first_name && user.last_name 
                    ? `${user.first_name} ${user.last_name}`
                    : user.username || 'User'
                  }
                </h2>
                <p className="text-gray-600 text-sm sm:text-base">
                  {user.email || 'No email provided'}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="material-symbols-outlined text-blue-600 text-sm">person</span>
                  <span className="text-sm text-gray-600">
                    {user.client_short_name?.toUpperCase() || 'Client Account'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    disabled={!isEditing || loading}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    disabled={!isEditing || loading}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    disabled={!isEditing || loading}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    disabled={!isEditing || loading}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  disabled={!isEditing || loading}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  disabled={!isEditing || loading}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({...formData, position: e.target.value})}
                disabled={!isEditing || loading}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600">business</span>
                  <span className="text-sm text-gray-900">Client Account</span>
                </div>
                {user.client?.name && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Client</label>
                    <p className="mt-1 text-sm text-gray-900">{user.client.name}</p>
                  </div>
                )}
                {user.role && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{user.role}</p>
                  </div>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
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