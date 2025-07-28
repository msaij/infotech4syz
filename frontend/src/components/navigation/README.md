# Dynamic Navigation System

This directory contains the dynamic navigation system for the FourSyz application, which provides policy-based navigation that adapts to user permissions.

## Overview

The navigation system consists of several components that work together to provide a seamless, permission-based navigation experience:

- **DynamicNavigation**: Main navigation component with responsive design
- **Breadcrumbs**: Shows current navigation path
- **QuickActions**: Permission-based action buttons for the dashboard
- **NavigationContext**: Global state management for navigation
- **useNavigationPermissions**: Hook for efficient permission evaluation

## Components

### DynamicNavigation

The main navigation component that renders the top navigation bar. Features:

- **Permission-based rendering**: Only shows navigation items the user has access to
- **Responsive design**: Mobile-friendly with collapsible menu
- **Loading states**: Skeleton loaders while checking permissions
- **Error handling**: Graceful fallback when permission checks fail
- **User menu**: Dropdown with user info and logout option

### Breadcrumbs

Shows the current navigation path with clickable links for easy navigation.

### QuickActions

Renders permission-based action buttons for the dashboard. Only shows actions the user has access to.

## Configuration

Navigation items are configured in `frontend/src/config/navigation.ts`:

```typescript
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
  // ... more items
];
```

## Usage

### Basic Usage

```tsx
import { DynamicNavigation, Breadcrumbs, QuickActions } from '@/components/navigation';

// In your layout
<DynamicNavigation user={user} onLogout={handleLogout} />

// In your page
<Breadcrumbs />
<QuickActions />
```

### Using Navigation Context

```tsx
import { useNavigation } from '@/contexts/NavigationContext';

const MyComponent = () => {
  const { 
    accessibleItems, 
    isItemAccessible, 
    navigateTo 
  } = useNavigation();

  // Check if user can access a specific item
  const canAccessUsers = isItemAccessible('user-management');

  // Navigate programmatically
  const handleClick = () => navigateTo('/foursyz/users');

  return (
    <div>
      {accessibleItems.map(item => (
        <button key={item.id} onClick={() => navigateTo(item.href)}>
          {item.label}
        </button>
      ))}
    </div>
  );
};
```

## Permission System Integration

The navigation system integrates with the existing policy-based permission system:

1. **Permission Evaluation**: Uses `PolicyService.evaluatePermission()` to check access
2. **Caching**: Caches permission results for 5 minutes to improve performance
3. **Real-time Updates**: Refreshes permissions when user data changes
4. **Error Recovery**: Handles permission check failures gracefully

## Performance Optimizations

- **Batch Permission Checking**: Evaluates multiple permissions in parallel
- **Caching**: 5-minute cache for permission results
- **Lazy Loading**: Only loads navigation items when needed
- **Debounced Updates**: Prevents excessive API calls

## Error Handling

The system provides comprehensive error handling:

- **Permission Check Failures**: Defaults to no access, logs warnings
- **API Failures**: Shows error messages, provides fallback navigation
- **Network Issues**: Graceful degradation with cached results
- **Invalid States**: Proper cleanup and recovery

## Accessibility

- **ARIA Labels**: Proper accessibility labels for screen readers
- **Keyboard Navigation**: Full keyboard navigation support
- **Focus Management**: Proper focus handling for dynamic content
- **High Contrast**: Supports high contrast mode

## Responsive Design

- **Mobile-First**: Collapsible mobile menu
- **Tablet Optimization**: Adaptive navigation for tablet screens
- **Desktop Enhancement**: Full navigation with potential sub-menus
- **Touch-Friendly**: Optimized for touch interactions

## File Structure

```
navigation/
├── DynamicNavigation.tsx    # Main navigation component
├── Breadcrumbs.tsx          # Breadcrumb component
├── QuickActions.tsx         # Quick actions component
├── index.ts                 # Export file
└── README.md               # This documentation
```

## Integration with Layout

The navigation system is integrated into the FourSyz layout (`frontend/src/app/foursyz/layout.tsx`):

```tsx
<NavigationProvider user={userData}>
  <DynamicNavigation user={userData!} onLogout={handleLogout} />
  <main>
    <Breadcrumbs />
    {children}
  </main>
</NavigationProvider>
```

## Testing

The navigation system should be tested for:

- **Permission-based rendering**: Items appear/disappear based on permissions
- **Responsive behavior**: Works on all device sizes
- **Error scenarios**: Handles permission check failures
- **Performance**: Caching and optimization work correctly
- **Accessibility**: Meets accessibility standards

## Future Enhancements

Potential improvements:

- **Sub-navigation**: Support for nested navigation items
- **Custom Icons**: Support for custom icon components
- **Notifications**: Badge support for notifications
- **Theming**: Support for different navigation themes
- **Analytics**: Track navigation usage patterns 