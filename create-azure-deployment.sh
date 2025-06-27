#!/bin/bash

echo "Creating Azure deployment package..."

# Create clean deployment directory
rm -rf azure-deployment
mkdir azure-deployment

# Copy essential files only
echo "Copying core application files..."
cp -r app azure-deployment/
cp -r shared azure-deployment/
cp -r types azure-deployment/
cp -r public azure-deployment/
cp next.config.azure.mjs azure-deployment/next.config.mjs
cp package.azure.json azure-deployment/package.json
cp staticwebapp.config.json azure-deployment/
cp tailwind.config.js azure-deployment/
cp postcss.config.mjs azure-deployment/
cp tsconfig.json azure-deployment/
cp .env.example azure-deployment/

# Copy API structure
mkdir -p azure-deployment/api/health
cp api/health/function.json azure-deployment/api/health/
cp api/health/index.js azure-deployment/api/health/

# Create .gitignore for deployment
cat > azure-deployment/.gitignore << 'EOF'
node_modules/
.next/
out/
.env.local
.env
*.log
.DS_Store
EOF

# Create README for GitHub
cat > azure-deployment/README.md << 'EOF'
# Rishi Platform

Cannabis workforce management system built with Next.js 15.3.2 and deployed on Azure Static Web Apps.

## Features
- Role-based access control
- Multi-organization support
- Real-time booking management
- Staff coordination tools
- Mobile-responsive design

## Deployment
This repository is configured for Azure Static Web Apps with:
- Static frontend (Next.js export)
- Azure Functions API
- Automated CI/CD via GitHub Actions
EOF

echo "✅ Azure deployment package created in ./azure-deployment/"
echo ""
echo "Next steps:"
echo "1. cd azure-deployment"
echo "2. git init"
echo "3. git add ."
echo "4. git commit -m 'Initial deployment'"
echo "5. git remote add origin https://github.com/YOUR_USERNAME/rishi-platform.git"
echo "6. git push -u origin main"