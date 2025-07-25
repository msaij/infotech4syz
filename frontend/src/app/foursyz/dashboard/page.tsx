'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService, UserData } from '@/utils/auth';
import { env } from '@/config/env';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [timeUntilExpiration, setTimeUntilExpiration] = useState<string>('');

  useEffect(() => {
    checkAuthStatus();
    const interval = setInterval(checkTokenExpiration, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

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
      updateTimeUntilExpiration(expirationTime);
    } catch (error) {
      handleLogout('Invalid user data. Please login again.');
    } finally {
      setLoading(false);
    }
  };

  const checkTokenExpiration = () => {
    const expirationTime = localStorage.getItem('tokenExpiration');
    if (expirationTime) {
      updateTimeUntilExpiration(expirationTime);
      
      if (Date.now() > parseInt(expirationTime)) {
        handleLogout('Token has expired. Please login again.');
      }
    }
  };

  const updateTimeUntilExpiration = (expirationTime: string | null) => {
    if (!expirationTime) return;

    const timeLeft = parseInt(expirationTime) - Date.now();
    if (timeLeft <= 0) {
      setTimeUntilExpiration('Expired');
      return;
    }

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      setTimeUntilExpiration(`${days}d ${hours}h ${minutes}m`);
    } else if (hours > 0) {
      setTimeUntilExpiration(`${hours}h ${minutes}m`);
    } else {
      setTimeUntilExpiration(`${minutes}m`);
    }
  };

  const handleLogout = async (message?: string) => {
    setLogoutLoading(true);
    
    try {
      const token = AuthService.getStoredToken(env.STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        // Call logout endpoint to blacklist token
        await fetch(`${env.API_BASE_URL}${env.AUTH_ENDPOINTS.LOGOUT}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">FourSyz Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Token expires in: <span className="font-medium text-orange-600">{timeUntilExpiration}</span>
              </div>
              <button
                onClick={() => handleLogout()}
                disabled={logoutLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              >
                {logoutLoading ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
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
          
          {/* Quick Actions */}
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/foursyz/create_user4syz')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Create New User
              </button>
              <button
                onClick={() => router.push(env.ROUTES.LOGIN)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
