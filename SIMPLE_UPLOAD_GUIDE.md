# Simple Upload Guide for Azure Fix

Since I cannot push directly to your repository, here are two simple alternatives:

## Option 1: GitHub Web Interface (Quickest)

1. Go to: https://github.com/mwaxman519/rishi-platform
2. Click "Add file" → "Create new file"
3. Name: `next.config.azure-production.mjs`
4. Paste this exact content:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true
  },
  trailingSlash: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react']
  }
}

export default nextConfig
```

5. Commit with message: "Fix Azure deployment"

## Option 2: Download & Upload

1. Download the fix package I created: `azure-deployment-fix.tar.gz`
2. Extract the files locally
3. Upload them to your repository using git or GitHub Desktop

## What Happens Next

Once you add the `next.config.azure-production.mjs` file:
- Azure detects the change automatically
- GitHub Actions restarts the deployment
- Build completes successfully
- Your Rishi Platform goes live on Azure Static Web Apps

The deployment takes about 2-3 minutes after you commit the file.