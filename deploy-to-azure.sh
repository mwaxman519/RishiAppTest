#!/bin/bash

echo "🚀 Rishi Platform - Azure Static Web Apps Deployment Script"
echo "========================================================="

# Step 1: Test current build
echo "Step 1: Testing current build..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix build errors first."
    exit 1
fi
echo "✅ Build test successful"

# Step 2: Create deployment directory
echo "Step 2: Creating deployment package..."
rm -rf azure-deployment
mkdir -p azure-deployment

# Step 3: Copy optimized files
echo "Step 3: Copying optimized application files..."
cp -r app azure-deployment/
cp -r shared azure-deployment/
cp -r types azure-deployment/
cp -r public azure-deployment/
cp -r api azure-deployment/
cp next.config.azure.mjs azure-deployment/next.config.mjs
cp package.azure.json azure-deployment/package.json
cp staticwebapp.config.json azure-deployment/
cp tailwind.config.js azure-deployment/
cp postcss.config.mjs azure-deployment/
cp tsconfig.json azure-deployment/
cp .env.example azure-deployment/

# Step 4: Create simplified package-lock.json
echo "Step 4: Creating optimized package-lock.json..."
cd azure-deployment
npm install --package-lock-only --no-save

# Step 5: Test Azure build
echo "Step 5: Testing Azure static export..."
npm run build:azure
if [ $? -ne 0 ]; then
    echo "❌ Azure build failed. Check configuration."
    exit 1
fi

cd ..
echo "✅ Azure deployment package created successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Create GitHub repository: 'rishi-platform'"
echo "2. Upload contents of 'azure-deployment' folder"
echo "3. In Azure Portal, create Static Web App with these settings:"
echo "   - Repository: your-github-username/rishi-platform"
echo "   - Branch: main"
echo "   - Build preset: Next.js"
echo "   - App location: /"
echo "   - API location: api"
echo "   - Output location: out"
echo ""
echo "🎯 Deployment package ready in: ./azure-deployment/"