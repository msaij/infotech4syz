'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService, UserData } from '@/utils/auth';
import { resourcePermissionService } from '@/utils/resourcePermissionService';
import { env } from '@/config/env';

interface CreateUserForm {
  username: string;
  email: string;
  password: string;
  designation: string;
  date_of_joining: string;
  date_of_relieving: string;
  active: boolean;
  notes: string;
}

interface CreateUserResponse {
  status: string;
  message: string;
  user?: {
    id: string;
    username: string;
    email: string;
    designation: string;
    date_of_joining: string;
    date_of_relieving?: string;
    active: boolean;
    notes?: string;
  };
}

export default function CreateUserPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [canCreateUser, setCanCreateUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<CreateUserForm>({
    username: '',
    email: '',
    password: '',
    designation: '',
    date_of_joining: '',
    date_of_relieving: '',
    active: true,
    notes: ''
  });

  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    checkUserPermissions();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const checkUserPermissions = async () => {
    try {
      // Get user data from AuthService
      const token = AuthService.getStoredToken(env.STORAGE_KEYS.ACCESS_TOKEN);
      if (!token) {
        router.push(env.ROUTES.LOGIN);
        return;
      }

      const userData = await AuthService.validateUser(token);
      if (!userData || !AuthService.isValidUser(userData)) {
        router.push(env.ROUTES.LOGIN);
        return;
      }

      setUser(userData);
      
      // Check if user has permission to create users
      const createUserPermission = await resourcePermissionService.evaluatePermission({
        user_id: userData.id,
        action: env.PERMISSIONS.ACTIONS.USER_CREATE,
        resource: env.PERMISSIONS.RESOURCES.USER_ALL
      });

      setCanCreateUser(createUserPermission.allowed);

      if (!createUserPermission.allowed) {
        // Redirect users without permission to dashboard
        router.push(env.ROUTES.DASHBOARD);
        return;
      }
    } catch (error) {
      console.error('Error checking user permissions:', error);
      setMessage({ type: 'error', text: 'Failed to verify user permissions' });
      router.push(env.ROUTES.DASHBOARD);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.username.trim()) errors.push('Username is required');
    if (formData.username.trim().length < 2) errors.push('Username must be at least 2 characters long');

    if (!formData.email.trim()) errors.push('Email is required');
    if (!formData.email.endsWith(env.REQUIRED_EMAIL_DOMAIN)) errors.push(`Email must be from ${env.REQUIRED_EMAIL_DOMAIN} domain`);

    if (!formData.password) errors.push('Password is required');
    if (formData.password.length < 6) errors.push('Password must be at least 6 characters long');

    if (!formData.designation.trim()) errors.push('Designation is required');
    if (formData.designation.trim().length < 2) errors.push('Designation must be at least 2 characters long');

    if (!formData.date_of_joining) errors.push('Date of joining is required');

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      setMessage({ type: 'error', text: errors.join(', ') });
      return;
    }

    setSubmitLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${env.API_BASE_URL}/auth/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          date_of_relieving: formData.date_of_relieving || null,
          notes: formData.notes || null
        }),
      });

      const data: CreateUserResponse = await response.json();

      if (response.ok && data.status === 'success') {
        setMessage({ type: 'success', text: 'User created successfully!' });
        setFormData({
          username: '',
          email: '',
          password: '',
          designation: '',
          date_of_joining: '',
          date_of_relieving: '',
          active: true,
          notes: ''
        });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to create user' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New User</h1>
          
          {message && (
            <div className={`mb-4 p-4 rounded-md ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username *
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
                placeholder="Enter username"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
                placeholder={`user${env.REQUIRED_EMAIL_DOMAIN}`}
                required
              />
              <p className="text-sm text-gray-500 mt-1">Must be from {env.REQUIRED_EMAIL_DOMAIN} domain</p>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
                placeholder="Enter password"
                required
              />
              <p className="text-sm text-gray-500 mt-1">Minimum 6 characters</p>
            </div>

            {/* Designation */}
            <div>
              <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-2">
                Designation *
              </label>
              <input
                type="text"
                id="designation"
                name="designation"
                value={formData.designation}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
                placeholder="e.g., Software Engineer"
                required
              />
            </div>

            {/* Date of Joining */}
            <div>
              <label htmlFor="date_of_joining" className="block text-sm font-medium text-gray-700 mb-2">
                Date of Joining *
              </label>
              <input
                type="date"
                id="date_of_joining"
                name="date_of_joining"
                value={formData.date_of_joining}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
                required
              />
            </div>

            {/* Date of Relieving */}
            <div>
              <label htmlFor="date_of_relieving" className="block text-sm font-medium text-gray-700 mb-2">
                Date of Relieving
              </label>
              <input
                type="date"
                id="date_of_relieving"
                name="date_of_relieving"
                value={formData.date_of_relieving}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
              />
              <p className="text-sm text-gray-500 mt-1">Optional - leave blank if still employed</p>
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                name="active"
                checked={formData.active}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                Active Account
              </label>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
                placeholder="Additional notes about the user..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitLoading ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
