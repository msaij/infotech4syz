# PWA Public Assets

This folder contains all Progressive Web App (PWA) related public assets for the DC Tracker application.

## 📁 File Structure

```
pwa/
├── README.md                    # This documentation
├── manifest.json               # Web App Manifest
└── icons/                      # PWA Icons
    ├── icon.svg               # Source SVG icon
    ├── apple-icon-180.png     # Apple touch icon
    ├── favicon-196.png        # Favicon
    ├── manifest-icon-192.maskable.png  # 192x192 icon
    └── manifest-icon-512.maskable.png  # 512x512 icon
```

## 🎨 Icons

### Generated Icons
All icons are automatically generated from the source `icon.svg` file using `pwa-asset-generator`.

#### Icon Sizes:
- **192x192**: `manifest-icon-192.maskable.png` - Standard PWA icon
- **512x512**: `manifest-icon-512.maskable.png` - High-resolution PWA icon
- **180x180**: `apple-icon-180.png` - Apple touch icon
- **196x196**: `favicon-196.png` - Favicon

#### Icon Purposes:
- **any**: Standard icon display
- **maskable**: Adaptive icon for Android (safe area)

### Source Icon
- **icon.svg**: Source SVG file used to generate all PNG icons
- **Design**: Blue background with white document/checkmark design
- **Colors**: Primary blue (#3B82F6) with white elements

## 📋 Manifest

### manifest.json
The Web App Manifest defines the PWA behavior and appearance.

#### Key Properties:
- **name**: "4SYZ - B2B | CORPORATE SUPPLIES"
- **short_name**: "4SYZ - B2B"
- **description**: "Corporate Supplies"
- **display**: "standalone" (app-like experience)
- **theme_color**: "#3b82f6" (blue)
- **background_color**: "#ffffff" (white)

#### App Shortcuts:
- **Dashboard**: Quick access to dashboard
- **Delivery Challans**: Quick access to challan management
- **Profile**: Quick access to user profile

## 🔧 Usage

### In HTML/Layout:
```html
<link rel="manifest" href="/pwa/manifest.json" />
<link rel="apple-touch-icon" href="/pwa/icons/apple-icon-180.png" />
<link rel="icon" type="image/png" sizes="196x196" href="/pwa/icons/favicon-196.png" />
```

### In Next.js Config:
```javascript
// next.config.mjs
const config = withPWA({
  dest: 'public/pwa',  // Updated path
  // ... other config
});
```

### In Components:
```typescript
// Dynamic manifest loading
const manifestData = await getManifestData('/pwa/manifest.json');
```

## 🛠️ Maintenance

### Regenerating Icons:
```bash
# Install pwa-asset-generator globally
npm install -g pwa-asset-generator

# Generate icons from source
pwa-asset-generator ./public/pwa/icons/icon.svg ./public/pwa/icons --icon-only --favicon --opaque false
```

### Updating Manifest:
1. Edit `manifest.json` directly
2. Update icon paths if needed
3. Test PWA installation
4. Verify all references are updated

### Adding New Icons:
1. Add new icon files to `icons/` folder
2. Update `manifest.json` with new icon entries
3. Update layout references if needed
4. Test across different platforms

## 📱 Platform Support

### Android:
- **Chrome**: Full PWA support with maskable icons
- **Firefox**: Full PWA support
- **Samsung Internet**: Full PWA support

### iOS:
- **Safari**: Limited PWA support
- **Chrome**: Full PWA support
- **Firefox**: Full PWA support

### Desktop:
- **Chrome**: Full PWA support
- **Edge**: Full PWA support
- **Firefox**: Full PWA support

## 🔍 Testing

### PWA Audit:
1. Use Chrome DevTools Lighthouse
2. Check "Progressive Web App" category
3. Verify all icons load correctly
4. Test installation flow

### Icon Testing:
1. Check all icon sizes display correctly
2. Verify maskable icons work on Android
3. Test Apple touch icon on iOS
4. Verify favicon appears in browser tabs

## 📊 File Sizes

### Optimized Assets:
- **SVG Source**: ~1KB
- **PNG Icons**: 5-15KB each
- **Manifest**: ~2KB
- **Total PWA Assets**: ~50KB

### Performance:
- Icons are cached aggressively
- Manifest is cached for 1 year
- SVG provides scalable source
- PNGs optimized for web

---

This organized structure ensures all PWA assets are properly managed and easily maintainable. 