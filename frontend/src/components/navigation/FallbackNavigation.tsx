'use client';

import React from 'react';
import Link from 'next/link';
import { UserData } from '@/utils/auth';
import { env } from '@/config/env';

interface FallbackNavigationProps {
  user: UserData;
  onLogout: () => void;
}

export const FallbackNavigation: React.FC<FallbackNavigationProps> = ({ user, onLogout }) => {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">FourSyz</h1>
          </div>
          
          {/* Basic Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href={env.ROUTES.DASHBOARD}
              className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              Dashboard
            </Link>
            <Link
              href={env.ROUTES.CREATE_USER}
              className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              Users
            </Link>
            <Link
              href={env.ROUTES.CLIENT_DETAILS}
              className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              Clients
            </Link>
            <Link
              href={env.ROUTES.DELIVERY_CHALLAN_TRACKER}
              className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              Delivery Challan
            </Link>
          </div>
          
          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <span className="hidden md:block">{user.username}</span>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}; 