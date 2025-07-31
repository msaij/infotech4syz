'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { NavigationItem, NAVIGATION_ITEMS, QUICK_ACTIONS, USER_MENU_ITEMS } from '@/config/navigation';
import { useNavigationPermissions } from '@/hooks/useNavigationPermissions';
import { UserData } from '@/utils/auth';

interface NavigationContextType {
  // Navigation state
  currentPath: string;
  
  // Permission state
  navigationItems: (NavigationItem & { hasAccess: boolean; loading: boolean; error?: string })[];
  quickActions: (NavigationItem & { hasAccess: boolean; loading: boolean; error?: string })[];
  userMenuItems: (NavigationItem & { hasAccess: boolean; loading: boolean; error?: string })[];
  accessibleItems: NavigationItem[];
  accessibleQuickActions: NavigationItem[];
  accessibleUserMenuItems: NavigationItem[];
  
  // Loading and error states
  loading: boolean;
  error?: string;
  lastUpdated: Date | null;
  
  // Actions
  refreshPermissions: () => void;
  navigateTo: (href: string) => void;
  isItemAccessible: (itemId: string) => boolean;
  isItemLoading: (itemId: string) => boolean;
  getItemError: (itemId: string) => string | undefined;
  
  // Cache management
  clearCache: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
  user?: UserData | null;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children, user }) => {
  const router = useRouter();
  const pathname = usePathname();
  
  const [currentPath, setCurrentPath] = useState(pathname);

  // Use navigation permissions hook for main navigation items
  const {
    accessibleItems: accessibleNavigationItems,
    loading: navigationLoading,
    error: navigationError,
    lastUpdated: navigationLastUpdated,
    refreshPermissions: refreshNavigationPermissions,
    isItemAccessible: isNavigationItemAccessible,
    isItemLoading: isNavigationItemLoading,
    getItemError: getNavigationItemError,
    clearCache: clearNavigationCache
  } = useNavigationPermissions(user?.id, NAVIGATION_ITEMS);

  // Use navigation permissions hook for quick actions
  const {
    accessibleItems: accessibleQuickActionItems,
    loading: quickActionsLoading,
    error: quickActionsError,
    lastUpdated: quickActionsLastUpdated,
    refreshPermissions: refreshQuickActionsPermissions,
    isItemAccessible: isQuickActionAccessible,
    isItemLoading: isQuickActionLoading,
    getItemError: getQuickActionError,
    clearCache: clearQuickActionsCache
  } = useNavigationPermissions(user?.id, QUICK_ACTIONS);

  // Use navigation permissions hook for user menu items
  const {
    accessibleItems: accessibleUserMenuItems,
    loading: userMenuLoading,
    error: userMenuError,
    lastUpdated: userMenuLastUpdated,
    refreshPermissions: refreshUserMenuPermissions,
    isItemAccessible: isUserMenuItemAccessible,
    isItemLoading: isUserMenuItemLoading,
    getItemError: getUserMenuItemError,
    clearCache: clearUserMenuCache
  } = useNavigationPermissions(user?.id, USER_MENU_ITEMS);

  // Update current path when pathname changes
  useEffect(() => {
    setCurrentPath(pathname);
  }, [pathname]);

  // Navigate to a specific route
  const navigateTo = useCallback((href: string) => {
    if (href.startsWith('#')) {
      // Handle special actions like logout
      if (href === '#logout') {
        // This will be handled by the component using the context
        return;
      }
      return;
    }
    
    router.push(href);
  }, [router]);

  // Refresh all permissions
  const refreshPermissions = useCallback(() => {
    refreshNavigationPermissions();
    refreshQuickActionsPermissions();
    refreshUserMenuPermissions();
  }, [refreshNavigationPermissions, refreshQuickActionsPermissions, refreshUserMenuPermissions]);

  // Clear all caches
  const clearCache = useCallback(() => {
    clearNavigationCache();
    clearQuickActionsCache();
    clearUserMenuCache();
  }, [clearNavigationCache, clearQuickActionsCache, clearUserMenuCache]);

  // Combined loading state
  const loading = navigationLoading || quickActionsLoading || userMenuLoading;

  // Combined error state
  const error = navigationError || quickActionsError || userMenuError;

  // Combined last updated (most recent)
  const lastUpdated = [navigationLastUpdated, quickActionsLastUpdated, userMenuLastUpdated]
    .filter(Boolean)
    .sort((a, b) => b!.getTime() - a!.getTime())[0] || null;

  // Check if specific item is accessible (works for all item types)
  const isItemAccessible = useCallback((itemId: string): boolean => {
    // Check if it's a logout item (always accessible)
    if (itemId === 'logout') return true;
    
    return (
      isNavigationItemAccessible(itemId) ||
      isQuickActionAccessible(itemId) ||
      isUserMenuItemAccessible(itemId)
    );
  }, [isNavigationItemAccessible, isQuickActionAccessible, isUserMenuItemAccessible]);

  // Check if specific item is loading (works for all item types)
  const isItemLoading = useCallback((itemId: string): boolean => {
    return (
      isNavigationItemLoading(itemId) ||
      isQuickActionLoading(itemId) ||
      isUserMenuItemLoading(itemId)
    );
  }, [isNavigationItemLoading, isQuickActionLoading, isUserMenuItemLoading]);

  // Get error for specific item (works for all item types)
  const getItemError = useCallback((itemId: string): string | undefined => {
    return (
      getNavigationItemError(itemId) ||
      getQuickActionError(itemId) ||
      getUserMenuItemError(itemId)
    );
  }, [getNavigationItemError, getQuickActionError, getUserMenuItemError]);

  // Get navigation items with their permission states
  const navigationItems = NAVIGATION_ITEMS.map(item => ({
    ...item,
    hasAccess: isItemAccessible(item.id),
    loading: isItemLoading(item.id),
    error: getItemError(item.id)
  }));

  // Get quick actions with their permission states
  const quickActions = QUICK_ACTIONS.map(item => ({
    ...item,
    hasAccess: isItemAccessible(item.id),
    loading: isItemLoading(item.id),
    error: getItemError(item.id)
  }));



  // Get user menu items with their permission states
  const userMenuItems = USER_MENU_ITEMS.map(item => ({
    ...item,
    hasAccess: isItemAccessible(item.id),
    loading: isItemLoading(item.id),
    error: getItemError(item.id)
  }));

  const contextValue: NavigationContextType = {
    // Navigation state
    currentPath,
    
    // Permission state
    navigationItems,
    quickActions,
    userMenuItems,
    accessibleItems: accessibleNavigationItems,
    accessibleQuickActions: accessibleQuickActionItems,
    accessibleUserMenuItems,
    
    // Loading and error states
    loading,
    error,
    lastUpdated,
    
    // Actions
    refreshPermissions,
    navigateTo,
    isItemAccessible,
    isItemLoading,
    getItemError,
    
    // Cache management
    clearCache
  };

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
};

// Custom hook to use navigation context
export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}; 