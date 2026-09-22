/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    /**
     * Performance: optimize barrel-file imports for react-icons
     * and other heavy packages — prevents bundling the entire library
     */
    optimizePackageImports: ['react-icons'],

    /**
     * Router cache staleTimes — reduce re-fetching on back navigation
     * dynamic: cache dynamic pages for 30s on client
     * static: cache static/ISR pages for 3min on client
     */
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
    /**
     * LCP: serve AVIF (smallest) with WebP fallback
     * Configured deviceSizes and imageSizes for responsive srcset generation
     */
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default nextConfig;
