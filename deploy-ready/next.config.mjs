/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  images: {
    unoptimized: true
  },
  experimental: {
    esmExternals: 'loose'
  },
  typescript: {
    ignoreBuildErrors: false
  },
  eslint: {
    ignoreDuringBuilds: false
  },
  // Optimize for Azure Static Web Apps
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  // Environment variables for build
  env: {
    AZURE_DEPLOYMENT: 'true'
  }
};

export default nextConfig;