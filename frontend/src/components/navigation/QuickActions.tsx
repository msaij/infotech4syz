'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useNavigation } from '@/contexts/NavigationContext';

export const QuickActions: React.FC = () => {
  const router = useRouter();
  const { navigationItems } = useNavigation();

  // Filter navigation items to show as quick actions
  const quickActions = navigationItems.filter(item => 
    item.path.includes('/foursyz/') && item.allowed
  );

  if (quickActions.length === 0) {
    // Show a message when no quick actions are available
    return (
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <p className="text-gray-500">No quick actions available for your current permissions.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="flex flex-wrap gap-4">
        {quickActions.map(action => (
          <button
            key={action.path}
            onClick={() => router.push(action.path)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2 transition-colors"
          >
            <span className="text-lg">{action.icon}</span>
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}; 