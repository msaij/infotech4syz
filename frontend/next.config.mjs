import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Environment variables for API integration
  env: {
    // Django REST API
    NEXT_PUBLIC_DJANGO_API_URL: process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000',
    NEXT_PUBLIC_DJANGO_DEBUG: process.env.NEXT_PUBLIC_DJANGO_DEBUG || 'false',
    
    // FastAPI SSE Service
    NEXT_PUBLIC_FASTAPI_URL: process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8001',
    NEXT_PUBLIC_FASTAPI_DEBUG: process.env.NEXT_PUBLIC_FASTAPI_DEBUG || 'false',
    
    // Feature flags
    NEXT_PUBLIC_ENABLE_SSE: process.env.NEXT_PUBLIC_ENABLE_SSE || 'true',
    NEXT_PUBLIC_ENABLE_REAL_TIME: process.env.NEXT_PUBLIC_ENABLE_REAL_TIME || 'true',
    NEXT_PUBLIC_ENABLE_AUDIT_LOGGING: process.env.NEXT_PUBLIC_ENABLE_AUDIT_LOGGING || 'true',
  },
  
  // Allowed development origins
  allowedDevOrigins: [
    'http://127.0.0.1:3000',
    'http://localhost:3000',
  ],
  
  // API routes configuration
  async rewrites() {
    return [
      // Proxy Django API calls
      {
        source: '/api/django/:path*',
        destination: `${process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000'}/api/:path*`,
      },
      // Proxy FastAPI calls
      {
        source: '/api/fastapi/:path*',
        destination: `${process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8001'}/api/:path*`,
      },
    ];
  },
  
  // Headers for security and CORS
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
  
  // Webpack configuration for better development experience
  webpack: (config, { dev, isServer }) => {
    // Add source maps in development
    if (dev) {
      config.devtool = 'eval-source-map';
    }
    
    // Optimize bundle size
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    };
    
    return config;
  },
  
  // Server external packages
  serverExternalPackages: ['@prisma/client'],
  
  // Image optimization
  images: {
    domains: ['localhost', '127.0.0.1'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // TypeScript configuration
  typescript: {
    // Don't fail build on TypeScript errors in development
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  
  // ESLint configuration
  eslint: {
    // Don't fail build on ESLint errors in development
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },
};

const config = withPWA({
  dest: 'public/pwa',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        },
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'gstatic-fonts-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        },
      },
    },
    {
      urlPattern: /\/api\/django\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'django-api-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 5, // 5 minutes
        },
      },
    },
    {
      urlPattern: /\/api\/fastapi\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'fastapi-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 1, // 1 minute (for real-time data)
        },
      },
    },
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-image-assets',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
    {
      urlPattern: /\/_next\/static\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static-assets',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60 * 365, // 1 year
        },
      },
    },
  ],
})(nextConfig);

export default config;