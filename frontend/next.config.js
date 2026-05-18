/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',

  // ── Production performance ────────────────────────────────────────────────
  compress: true,       // Enable gzip compression for all responses
  reactStrictMode: true,  // Catch double-render bugs early

  // Optimize barrel imports — prevents loading entire lucide/recharts libraries
  // This alone can reduce JS bundle by 30-40% for heavy icon/chart pages
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'recharts',
    ],
  },

  // Optimize images
  images: {
    unoptimized: false,
    formats: ['image/webp', 'image/avif'],  // Modern formats = faster loads
    minimumCacheTTL: 86400,  // Cache images for 24h
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Security + Cache headers
  async headers() {
    return [
      {
        // Cache static assets aggressively
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;