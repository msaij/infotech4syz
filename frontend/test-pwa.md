# PWA Testing Guide

## 🧪 How to Test Your PWA

### 1. **Build and Start Production Server**
```bash
cd frontend
npm run build
npm start
```

### 2. **Test PWA Installation**

#### Chrome/Edge Desktop:
1. Open `http://localhost:3000` in Chrome/Edge
2. Look for the install icon (📱) in the address bar
3. Click it to install the app
4. The app should open in a standalone window

#### Chrome Mobile:
1. Open `http://localhost:3000` in Chrome mobile
2. Tap the three dots menu
3. Select "Add to Home Screen"
4. The app should appear on your home screen

#### Safari iOS:
1. Open `http://localhost:3000` in Safari
2. Tap the share button (square with arrow)
3. Select "Add to Home Screen"
4. The app should appear on your home screen

### 3. **Test Offline Functionality**
1. Install the PWA
2. Disconnect from the internet
3. Open the app - it should still work with cached data
4. Navigate to `/offline` to see the offline page

### 4. **Test PWA Features**

#### Status Indicators:
- Look for PWA status badges in the top-right corner
- Should show "App" when installed
- Should show "Offline" when disconnected

#### Install Prompt:
- Should appear automatically when criteria are met
- Should be dismissible
- Should not appear if already installed

#### Caching:
- First visit: Normal loading
- Subsequent visits: Faster loading (cached)
- Offline: Should show cached content

### 5. **PWA Audit with Lighthouse**

#### In Chrome DevTools:
1. Open DevTools (F12)
2. Go to "Lighthouse" tab
3. Select "Progressive Web App"
4. Click "Generate report"
5. Should score 90+ on PWA metrics

#### Expected Scores:
- **PWA**: 90-100
- **Performance**: 80-100
- **Accessibility**: 90-100
- **Best Practices**: 90-100
- **SEO**: 90-100

### 6. **Common Issues & Solutions**

#### PWA Not Installing:
- ✅ Ensure HTTPS in production
- ✅ Check manifest.json is valid
- ✅ Verify service worker is registered
- ✅ Clear browser cache

#### Offline Not Working:
- ✅ Check service worker registration
- ✅ Verify caching strategies
- ✅ Test with real network disconnection

#### Icons Not Showing:
- ✅ Check icon paths in manifest
- ✅ Verify icon formats (PNG)
- ✅ Ensure proper sizes are provided

### 7. **Development vs Production**

#### Development Mode:
- PWA features are disabled
- Faster build times
- No service worker caching

#### Production Mode:
- Full PWA features enabled
- Service worker active
- Caching strategies applied

### 8. **Testing Checklist**

- [ ] App installs successfully
- [ ] App opens in standalone mode
- [ ] Offline functionality works
- [ ] Caching improves performance
- [ ] Install prompt appears appropriately
- [ ] Status indicators show correctly
- [ ] App shortcuts work
- [ ] Icons display properly
- [ ] Lighthouse audit passes
- [ ] Works on multiple devices

### 9. **Debug Commands**

```javascript
// Check service worker status
navigator.serviceWorker.getRegistrations()

// Check if app is installed
window.matchMedia('(display-mode: standalone)').matches

// Check online status
navigator.onLine

// Clear all caches
caches.keys().then(names => names.forEach(name => caches.delete(name)))

// Check manifest
fetch('/manifest.json').then(r => r.json()).then(console.log)
```

### 10. **Production Deployment**

For production, ensure:
- ✅ HTTPS is enabled
- ✅ Domain is configured in manifest
- ✅ Environment variables are set
- ✅ CDN is configured for assets
- ✅ Monitoring is in place

---

Your PWA should now be fully functional! 🚀 