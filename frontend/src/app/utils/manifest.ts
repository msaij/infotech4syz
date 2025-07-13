// Utility to read manifest.json for dynamic values
export async function getManifestData() {
  try {
    const response = await fetch('/pwa/manifest.json');
    const manifest = await response.json();
    return {
      name: manifest.name || '4SYZ - B2B | CORPORATE SUPPLIES',
      shortName: manifest.short_name || '4SYZ - B2B',
      description: manifest.description || 'Corporate Supplies',
      themeColor: manifest.theme_color || '#3b82f6',
      backgroundColor: manifest.background_color || '#ffffff',
    };
  } catch (error) {
    console.warn('Failed to load manifest.json, using fallback values:', error);
    return {
      name: '4SYZ - B2B | CORPORATE SUPPLIES',
      shortName: '4SYZ - B2B',
      description: 'Corporate Supplies',
      themeColor: '#3b82f6',
      backgroundColor: '#ffffff',
    };
  }
}

// Fallback values for server-side rendering
export const fallbackManifestData = {
  name: '4SYZ - B2B | CORPORATE SUPPLIES',
  shortName: '4SYZ - B2B',
  description: 'Corporate Supplies',
  themeColor: '#3b82f6',
  backgroundColor: '#ffffff',
}; 