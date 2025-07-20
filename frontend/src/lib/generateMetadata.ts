import { fallbackManifestData } from './manifest';

// Function to generate metadata from manifest data
export function generateMetadata(manifestData = fallbackManifestData) {
  return {
    title: manifestData.name,
    description: `${manifestData.description} - Real-time delivery challan management platform with user management and data tracking capabilities`,
    keywords: ["corporate supplies", "b2b", "delivery challan", "logistics", "management", "tracking", "real-time"],
    authors: [{ name: "4SYZ" }],
    creator: "4SYZ",
    publisher: "4SYZ",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
    alternates: {
      canonical: '/',
    },
    openGraph: {
      title: manifestData.name,
      description: `${manifestData.description} - Real-time delivery challan management platform with user management and data tracking capabilities`,
      url: '/',
      siteName: manifestData.shortName,
      images: [
        {
          url: '/pwa/icons/manifest-icon-512.maskable.png',
          width: 512,
          height: 512,
          alt: `${manifestData.shortName} Logo`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: manifestData.name,
      description: `${manifestData.description} - Real-time delivery challan management platform with user management and data tracking capabilities`,
      images: ['/pwa/icons/manifest-icon-512.maskable.png'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
    manifest: '/pwa/manifest.json',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: manifestData.shortName,
    },
    applicationName: manifestData.shortName,
    referrer: 'origin-when-cross-origin',
    category: 'business',
  };
}

export function generateViewport(manifestData = fallbackManifestData) {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: manifestData.themeColor,
    colorScheme: 'light',
  };
} 