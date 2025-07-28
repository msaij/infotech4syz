import { useState, useEffect, useCallback, useRef } from 'react';
import { PolicyService } from '@/utils/policyService';
import { NavigationItem } from '@/config/navigation';

interface PermissionResult {
  item: NavigationItem;
  hasAccess: boolean;
  loading: boolean;
  error?: string;
}

interface NavigationPermissionsState {
  items: PermissionResult[];
  loading: boolean;
  error?: string;
  lastUpdated: Date | null;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export const useNavigationPermissions = (userId?: string, items: NavigationItem[] = []) => {
  const [state, setState] = useState<NavigationPermissionsState>({
    items: [],
    loading: true,
    error: undefined,
    lastUpdated: null
  });

  const cacheRef = useRef<Map<string, { result: boolean; timestamp: number }>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

  // Clear expired cache entries
  const clearExpiredCache = useCallback(() => {
    const now = Date.now();
    for (const [key, value] of cacheRef.current.entries()) {
      if (now - value.timestamp > CACHE_DURATION) {
        cacheRef.current.delete(key);
      }
    }
  }, []);

  // Check if we have valid cached results
  const hasValidCache = useCallback(() => {
    if (!state.lastUpdated) return false;
    return Date.now() - state.lastUpdated.getTime() < CACHE_DURATION;
  }, [state.lastUpdated]);

  // Get cached permission result
  const getCachedPermission = useCallback((item: NavigationItem): boolean | null => {
    const key = `${userId}-${item.requiredAction}-${item.requiredResource}`;
    const cached = cacheRef.current.get(key);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.result;
    }
    
    return null;
  }, [userId]);

  // Set cached permission result
  const setCachedPermission = useCallback((item: NavigationItem, result: boolean) => {
    const key = `${userId}-${item.requiredAction}-${item.requiredResource}`;
    cacheRef.current.set(key, { result, timestamp: Date.now() });
  }, [userId]);

  // Evaluate permissions for navigation items
  const evaluatePermissions = useCallback(async (forceRefresh = false) => {
    if (!userId || items.length === 0) {
      setState(prev => ({ ...prev, loading: false, items: [] }));
      return;
    }

    // Don't refresh if we have valid cache and not forcing refresh
    if (!forceRefresh && hasValidCache()) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setState(prev => ({ ...prev, loading: true, error: undefined }));

    try {
      clearExpiredCache();

      // Initialize items with loading state
      const initialItems: PermissionResult[] = items.map(item => ({
        item,
        hasAccess: false,
        loading: true
      }));

      setState(prev => ({ ...prev, items: initialItems }));

             // Evaluate permissions in parallel with individual error handling
       const permissionPromises = items.map(async (item) => {
        try {
          // Check cache first
          const cachedResult = getCachedPermission(item);
          if (cachedResult !== null) {
            return {
              item,
              hasAccess: cachedResult,
              loading: false
            };
          }

          // Evaluate permission via API
          const evaluation = await PolicyService.evaluatePermission({
            user_id: userId,
            action: item.requiredAction,
            resource: item.requiredResource
          });

          const result = evaluation.allowed;
          
          // Cache the result
          setCachedPermission(item, result);

          return {
            item,
            hasAccess: result,
            loading: false
          };
                 } catch (error: unknown) {
           // If permission check fails, default to false access
           const errorMessage = error instanceof Error ? error.message : 'Permission check failed';
           console.warn(`Permission check failed for ${item.id}:`, error);
           return {
             item,
             hasAccess: false,
             loading: false,
             error: errorMessage
           };
         }
      });

      const results = await Promise.all(permissionPromises);

      // Check if request was cancelled
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      setState({
        items: results,
        loading: false,
        error: undefined,
        lastUpdated: new Date()
      });

         } catch (error: unknown) {
       // Check if request was cancelled
       if (abortControllerRef.current?.signal.aborted) {
         return;
       }

       const errorMessage = error instanceof Error ? error.message : 'Failed to evaluate permissions';
       console.error('Failed to evaluate navigation permissions:', error);
       setState(prev => ({
         ...prev,
         loading: false,
         error: errorMessage
       }));
     }
  }, [userId, items, hasValidCache, clearExpiredCache, getCachedPermission, setCachedPermission]);

  // Refresh permissions
  const refreshPermissions = useCallback(() => {
    evaluatePermissions(true);
  }, [evaluatePermissions]);

  // Get accessible items
  const accessibleItems = state.items.filter(item => 
    (item.hasAccess && !item.loading) || item.item.alwaysAccessible
  );



  // Get items with errors
  const itemsWithErrors = state.items.filter(item => item.error);

  // Check if specific item is accessible
  const isItemAccessible = useCallback((itemId: string): boolean => {
    const item = state.items.find(i => i.item.id === itemId);
    if (!item) return false;
    
    // If item is marked as always accessible, return true
    if (item.item.alwaysAccessible) return true;
    
    return item.hasAccess && !item.loading;
  }, [state.items]);

  // Check if specific item is loading
  const isItemLoading = useCallback((itemId: string): boolean => {
    const item = state.items.find(i => i.item.id === itemId);
    return item ? item.loading : false;
  }, [state.items]);

  // Get error for specific item
  const getItemError = useCallback((itemId: string): string | undefined => {
    const item = state.items.find(i => i.item.id === itemId);
    return item?.error;
  }, [state.items]);

  // Effect to evaluate permissions when userId or items change
  useEffect(() => {
    evaluatePermissions();
  }, [evaluatePermissions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    // State
    items: state.items,
    accessibleItems,
    itemsWithErrors,
    loading: state.loading,
    error: state.error,
    lastUpdated: state.lastUpdated,

    // Actions
    refreshPermissions,
    evaluatePermissions,

    // Utilities
    isItemAccessible,
    isItemLoading,
    getItemError,

    // Cache management
    clearCache: () => {
      cacheRef.current.clear();
      setState(prev => ({ ...prev, lastUpdated: null }));
    }
  };
}; 