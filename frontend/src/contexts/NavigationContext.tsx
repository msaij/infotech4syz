'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { NavigationPermission, useNavigationPermissions } from '@/hooks/useNavigationPermissions';
import { UserData } from '@/utils/auth';

interface NavigationContextType {
  // Navigation state
  currentPath: string;
  
  // Permission state
  navigationItems: (NavigationPermission & { loading: boolean; error?: string })[];
  
  // Loading and error states
  loading: boolean;
  error?: string;
  
  // Actions
  refreshPermissions: () => void;
  navigateTo: (href: string) => void;
  canAccessRoute: (route: string) => boolean;
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

  // Use navigation permissions hook
  const {
    permissions,
    loading,
    error,
    getNavigationItems,
    canAccessRoute,
    refreshPermissions
  } = useNavigationPermissions(user?.id || '');

  // Convert null error to undefined
  const navigationError = error || undefined;

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

  // Get navigation items with their permission states
  const navigationItems = getNavigationItems().map((item: NavigationPermission) => ({
    ...item,
    loading: false,
    error: undefined
  }));

  const contextValue: NavigationContextType = {
    // Navigation state
    currentPath,
    
    // Permission state
    navigationItems,
    
    // Loading and error states
    loading,
    error: navigationError,
    
    // Actions
    refreshPermissions,
    navigateTo,
    canAccessRoute
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