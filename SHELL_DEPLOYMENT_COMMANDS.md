# Shell Commands to Deploy Azure Fix

Run these commands in your local terminal where you have git access:

## Download the fix package from Replit
```bash
# Download the deployment fix package
curl -L "https://3517da39-7603-40ea-b364-fdfd91837371-00-33fp2yev8yflw.spock.replit.dev/azure-deployment-fix.tar.gz" -o azure-deployment-fix.tar.gz

# Extract the files
tar -xzf azure-deployment-fix.tar.gz

# Navigate to your repository
cd /path/to/your/rishi-platform

# Copy the files to your repository
cp next.config.azure-production.mjs ./
cp -r scripts ./
cp -r shared ./

# Add and commit the files
git add next.config.azure-production.mjs scripts/ shared/
git commit -m "Fix Azure deployment: Add missing production configuration files"
git push origin main
```

## Alternative: Create files directly
```bash
# Navigate to your repository
cd /path/to/your/rishi-platform

# Create the missing Azure production config
cat > next.config.azure-production.mjs << 'EOF'
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
EOF

# Commit and push
git add next.config.azure-production.mjs
git commit -m "Fix Azure deployment: Add missing production config"
git push origin main
```

Replace `/path/to/your/rishi-platform` with your actual repository path.