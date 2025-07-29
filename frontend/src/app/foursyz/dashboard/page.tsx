'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService, UserData } from '@/utils/auth';


import { env } from '@/config/env';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [_logoutLoading, setLogoutLoading] = useState(false);


  useEffect(() => {
    checkAuthStatus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const checkAuthStatus = () => {
    const token = AuthService.getStoredToken(env.STORAGE_KEYS.ACCESS_TOKEN);
    const userData = localStorage.getItem('user');
    const expirationTime = localStorage.getItem('tokenExpiration');

    if (!token || !userData) {
      router.push(env.ROUTES.LOGIN);
      return;
    }

    // Check if token is expired
    if (expirationTime && Date.now() > parseInt(expirationTime)) {
      handleLogout('Token has expired. Please login again.');
      return;
    }

    try {
      const user = JSON.parse(userData);
      setUser(user);
    } catch (_error) {
      handleLogout('Invalid user data. Please login again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async (message?: string) => {
    setLogoutLoading(true);
    
    try {
      const token = AuthService.getStoredToken(env.STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        // Call logout endpoint to blacklist token
        await fetch(`${env.API_BASE_URL}${env.API_ENDPOINTS.AUTH_ENDPOINTS.LOGOUT}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (_error) {
      console.error('Logout API call failed:', _error);
    } finally {
      // Clear all auth data
      AuthService.clearAuthTokens();
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('tokenExpiration');
      
      if (message) {
        alert(message);
      }
      
      router.push(env.ROUTES.LOGIN);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">User Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <p className="mt-1 text-sm text-gray-900">{user.username}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Designation</label>
                  <p className="mt-1 text-sm text-gray-900">{user.designation}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Joining</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(user.date_of_joining)}</p>
                </div>
                
                {user.date_of_relieving && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date of Relieving</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(user.date_of_relieving)}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
            
            {user.notes && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <p className="mt-1 text-sm text-gray-900">{user.notes}</p>
              </div>
            )}
          </div>
    </div>
  );
}
