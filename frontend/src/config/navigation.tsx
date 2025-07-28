import React from 'react';
import { env } from './env';

// Icon components (we'll use simple SVG icons for now)
const HomeIcon: React.FC = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const UsersIcon: React.FC = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const BuildingIcon: React.FC = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const TruckIcon: React.FC = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
  </svg>
);

const ShieldIcon: React.FC = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const LogoutIcon: React.FC = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType;
  requiredAction: string;
  requiredResource: string;
  children?: NavigationItem[];
  badge?: string;
  description?: string;
  external?: boolean;
  alwaysAccessible?: boolean;
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: env.ROUTES.DASHBOARD,
    icon: HomeIcon,
    requiredAction: env.PERMISSIONS.ACTIONS.AUTH_ME,
    requiredResource: env.PERMISSIONS.RESOURCES.AUTH_ALL,
    description: 'Main dashboard and overview'
  },
  {
    id: 'user-management',
    label: 'User Management',
    href: env.ROUTES.CREATE_USER,
    icon: UsersIcon,
    requiredAction: env.PERMISSIONS.ACTIONS.USER_CREATE,
    requiredResource: env.PERMISSIONS.RESOURCES.USER_ALL,
    description: 'Create and manage users'
  },
  {
    id: 'client-management',
    label: 'Client Management',
    href: env.ROUTES.CLIENT_DETAILS,
    icon: BuildingIcon,
    requiredAction: env.PERMISSIONS.ACTIONS.CLIENT_READ,
    requiredResource: env.PERMISSIONS.RESOURCES.CLIENT_ALL,
    description: 'Manage client information'
  },
  {
    id: 'delivery-challan',
    label: 'Delivery Challan',
    href: env.ROUTES.DELIVERY_CHALLAN_TRACKER,
    icon: TruckIcon,
    requiredAction: env.PERMISSIONS.ACTIONS.DELIVERY_CHALLAN_READ,
    requiredResource: env.PERMISSIONS.RESOURCES.DELIVERY_CHALLAN_ALL,
    description: 'Track delivery challans'
  },
  {
    id: 'policy-management',
    label: 'Policy Management',
    href: env.ROUTES.POLICY_MANAGEMENT,
    icon: ShieldIcon,
    requiredAction: env.PERMISSIONS.ACTIONS.PERMISSIONS_READ,
    requiredResource: env.PERMISSIONS.RESOURCES.PERMISSIONS_ALL,
    description: 'Manage permissions and policies'
  }
];

// Quick actions for dashboard (subset of navigation items)
export const QUICK_ACTIONS: NavigationItem[] = [
  {
    id: 'create-user',
    label: 'Create New User',
    href: env.ROUTES.CREATE_USER,
    icon: UsersIcon,
    requiredAction: env.PERMISSIONS.ACTIONS.USER_CREATE,
    requiredResource: env.PERMISSIONS.RESOURCES.USER_ALL
  },
  {
    id: 'manage-clients',
    label: 'Manage Clients',
    href: env.ROUTES.CLIENT_DETAILS,
    icon: BuildingIcon,
    requiredAction: env.PERMISSIONS.ACTIONS.CLIENT_READ,
    requiredResource: env.PERMISSIONS.RESOURCES.CLIENT_ALL
  },
  {
    id: 'delivery-tracker',
    label: 'Delivery Challan Tracker',
    href: env.ROUTES.DELIVERY_CHALLAN_TRACKER,
    icon: TruckIcon,
    requiredAction: env.PERMISSIONS.ACTIONS.DELIVERY_CHALLAN_READ,
    requiredResource: env.PERMISSIONS.RESOURCES.DELIVERY_CHALLAN_ALL
  },
  {
    id: 'policy-management',
    label: 'Policy Management',
    href: env.ROUTES.POLICY_MANAGEMENT,
    icon: ShieldIcon,
    requiredAction: env.PERMISSIONS.ACTIONS.PERMISSIONS_READ,
    requiredResource: env.PERMISSIONS.RESOURCES.PERMISSIONS_ALL
  }
];

// User menu items (always visible when logged in)
export const USER_MENU_ITEMS: NavigationItem[] = [
  {
    id: 'logout',
    label: 'Logout',
    href: '#',
    icon: LogoutIcon,
    requiredAction: env.PERMISSIONS.ACTIONS.AUTH_LOGOUT,
    requiredResource: env.PERMISSIONS.RESOURCES.AUTH_ALL,
    alwaysAccessible: true
  }
]; 