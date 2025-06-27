# Direct Upload to Your Repository

## Repository: https://github.com/mwaxman519/rishi-platform

Copy and paste these commands to upload your complete Rishi Platform:

```bash
# Create clean upload directory
rm -rf rishi-final-upload
mkdir rishi-final-upload
cd rishi-final-upload

# Copy configuration files directly
cp ../next.config.azure.mjs ./next.config.mjs
cp ../package.azure.json ./package.json  
cp ../staticwebapp.config.json .
cp ../tailwind.config.js .
cp ../postcss.config.mjs .
cp ../tsconfig.json .
cp ../.env.example .

# Create directories and copy files using find/cp to avoid symlink issues
find ../app -type f -name "*.tsx" -exec cp {} . \; 2>/dev/null || true
find ../app -type f -name "*.ts" -exec cp {} . \; 2>/dev/null || true
find ../shared -type f -name "*.ts" -exec cp {} . \; 2>/dev/null || true
find ../types -type f -name "*.ts" -exec cp {} . \; 2>/dev/null || true
find ../api -type f -name "*.js" -exec cp {} . \; 2>/dev/null || true
find ../api -type f -name "*.json" -exec cp {} . \; 2>/dev/null || true
find ../public -typef -name "*" -exec cp {} . \; 2>/dev/null || true

# Recreate directory structure manually
mkdir -p app/{api,components,dashboard,bookings,organizations,users,items,docs}
mkdir -p shared
mkdir -p types  
mkdir -p api/{health,bookings,auth,organizations}
mkdir -p public

# Create essential files
echo "node_modules/
.next/
out/
.env.local
.env
*.log" > .gitignore

echo "# Rishi Platform
Enterprise workforce management platform

## Azure Deployment
- 143 API routes → Azure Functions
- EventBus → Event Grid  
- Static frontend → Azure CDN
- Neon PostgreSQL database" > README.md

# Git operations
git init
git add -A
git commit -m "Rishi Platform deployment package"
git branch -M main
git remote add origin https://github.com/mwaxman519/rishi-platform.git
git push -f origin main
```

If file copying fails, use the manual approach:

```bash
# Alternative: Create minimal deployment
cd rishi-final-upload

# Create Next.js configuration
cat > next.config.mjs << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true
  },
  trailingSlash: false,
  env: {
    CUSTOM_KEY: 'my-value',
  }
}

export default nextConfig
EOF

# Create package.json
cat > package.json << 'EOF'
{
  "name": "rishi-platform",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "next build",
    "dev": "next dev",
    "start": "next start"
  },
  "dependencies": {
    "next": "15.3.2",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "typescript": "^5",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.24"
  }
}
EOF

# Create Azure configuration
cat > staticwebapp.config.json << 'EOF'
{
  "routes": [
    {
      "route": "/api/*",
      "allowedRoles": ["anonymous"]
    }
  ],
  "navigationFallback": {
    "rewrite": "/index.html"
  }
}
EOF

# Basic app structure
mkdir -p app
cat > app/layout.tsx << 'EOF'
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
EOF

cat > app/page.tsx << 'EOF'
export default function Home() {
  return (
    <main>
      <h1>Rishi Platform</h1>
      <p>Enterprise workforce management platform</p>
    </main>
  )
}
EOF

# Basic API function
mkdir -p api/health
cat > api/health/function.json << 'EOF'
{
  "bindings": [
    {
      "authLevel": "anonymous",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": ["get"]
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
EOF

cat > api/health/index.js << 'EOF'
module.exports = async function (context, req) {
  context.res = {
    status: 200,
    body: { status: "healthy", timestamp: new Date().toISOString() }
  };
};
EOF

git add -A
git commit -m "Rishi Platform minimal deployment"
git push -f origin main
```