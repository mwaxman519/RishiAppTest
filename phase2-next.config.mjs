/** @type {import('next').NextConfig} */
const nextConfig = {
  // Azure Static Web Apps static export configuration
  output: 'export',
  distDir: 'out',
  trailingSlash: true,
  
  // Disable features not compatible with static export
  images: {
    unoptimized: true
  },
  
  // Disable server-side features for static export
  experimental: {
    webpackBuildWorker: false
  },
  
  // Webpack configuration for Azure compatibility
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },
  
  // Header configuration for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default nextConfig;