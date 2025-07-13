# PWA Components

This folder contains all Progressive Web App (PWA) related components for the DC Tracker application.

## 📁 File Structure

```
pwa/
├── index.ts                    # Export file for clean imports
├── PWAInstallPrompt.tsx        # Install prompt component
├── PWAStatus.tsx              # PWA status indicators
├── ServiceWorkerRegistration.tsx # Service worker registration
└── README.md                  # This documentation
```

## 🧩 Components

### `PWAInstallPrompt.tsx`
- **Purpose**: Shows install prompt when PWA can be installed
- **Features**: 
  - Automatic detection of install criteria
  - User-friendly install/dismiss options
  - Handles installation flow
- **Usage**: Automatically included in root layout

### `PWAStatus.tsx`
- **Purpose**: Shows PWA and connection status
- **Features**:
  - Installation status indicator
  - Online/offline status
  - Sync status for installed apps
- **Usage**: Included in authenticated layout

### `ServiceWorkerRegistration.tsx`
- **Purpose**: Handles service worker registration and updates
- **Features**:
  - Automatic service worker registration
  - Update detection and prompts
  - Online/offline event handling
- **Usage**: Automatically included in root layout

## 🔧 Usage

### Import Components
```typescript
// Import individual components
import { PWAInstallPrompt } from '@/components/pwa';
import { PWAStatus } from '@/components/pwa';
import { ServiceWorkerRegistration } from '@/components/pwa';

// Or import all
import { PWAInstallPrompt, PWAStatus, ServiceWorkerRegistration } from '@/components/pwa';
```

### Automatic Integration
The PWA components are automatically integrated:
- `PWAInstallPrompt` and `ServiceWorkerRegistration` in root layout
- `PWAStatus` in authenticated layout

## 🎯 Features

### Installation Flow
1. User visits the app
2. `PWAInstallPrompt` detects install criteria
3. Shows install prompt if eligible
4. Handles user choice (install/dismiss)

### Status Monitoring
1. `PWAStatus` monitors installation state
2. Shows real-time connection status
3. Provides visual feedback for app state

### Service Worker Management
1. `ServiceWorkerRegistration` registers SW
2. Monitors for updates
3. Handles update prompts
4. Manages offline/online events

## 🔄 State Management

### PWA States
- **Not Installed**: Regular web app
- **Installed**: Standalone app mode
- **Offline**: Cached data access
- **Online**: Full functionality

### Status Indicators
- 🟢 **App**: PWA is installed
- 🟡 **Offline**: No internet connection
- 🔵 **Synced**: Online and up to date

## 🛠️ Development

### Adding New PWA Features
1. Create component in this folder
2. Export from `index.ts`
3. Import where needed
4. Update documentation

### Testing PWA Components
- Test installation flow
- Test offline functionality
- Test status indicators
- Test service worker updates

## 📱 Platform Support

### Mobile
- **iOS Safari**: Full PWA support
- **Android Chrome**: Full PWA support
- **Android Firefox**: Full PWA support

### Desktop
- **Chrome**: Full PWA support
- **Edge**: Full PWA support
- **Firefox**: Full PWA support

---

These components work together to provide a complete PWA experience for the DC Tracker application. 