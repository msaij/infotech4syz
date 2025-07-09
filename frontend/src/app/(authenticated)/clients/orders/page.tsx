"use client";

import { useAuth } from "@/components/(access-providers)/auth-context";
import LoadingPage from "@/components/LoadingPage";

export default function ClientOrders() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                My Orders
              </h1>
              <p className="mt-1 text-sm sm:text-base text-gray-600">
                View and manage your orders
                {user?.group_name && (
                  <span className="ml-2 text-gray-500">• {user.group_name}</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">
              shopping_cart
            </span>
            <p className="text-gray-500 text-sm sm:text-base">
              No orders found
            </p>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              Your orders will appear here when you place them
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 