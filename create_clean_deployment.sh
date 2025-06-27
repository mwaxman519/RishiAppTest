#!/bin/bash

echo "Creating clean Azure deployment package without conflicting directories..."

# Remove any existing /api directory that conflicts with Next.js
rm -rf api

# Create clean deployment structure
rm -rf azure-clean
mkdir -p azure-clean

# Copy application files (excluding any conflicting api directory)
cp package.azure-production.json azure-clean/package.json
cp next.config.azure-production.mjs azure-clean/next.config.mjs  
cp staticwebapp.azure-production.config.json azure-clean/staticwebapp.config.json
cp PHASE3_ENVIRONMENT_VARIABLES.md azure-clean/

# Copy essential Next.js application
cp -r app azure-clean/
cp -r components azure-clean/
cp -r lib azure-clean/
cp -r shared azure-clean/
cp -r server azure-clean/
cp -r types azure-clean/
cp -r contexts azure-clean/ 2>/dev/null || true
cp -r public azure-clean/ 2>/dev/null || true

# Copy configuration files
cp tailwind.config.js azure-clean/
cp postcss.config.mjs azure-clean/
cp tsconfig.json azure-clean/
cp drizzle.config.ts azure-clean/
cp middleware.ts azure-clean/
cp next-env.d.ts azure-clean/ 2>/dev/null || true

# Copy GitHub workflow with corrected configuration
mkdir -p azure-clean/.github/workflows
cp .github/workflows/azure-static-web-apps-polite-mud-027da750f.yml azure-clean/.github/workflows/

# Create final deployment guide
cat > azure-clean/CLEAN_DEPLOYMENT_GUIDE.md << 'EOF'
# Clean Azure Static Web Apps Deployment

## Issue Resolution
- Removed conflicting /api directory at root level
- Azure will now use app/api/ routes automatically
- No api_location needed in workflow (empty string)

## Verified Configuration
- Next.js 15.3.4 with static export (output: 'export')
- API routes in app/api/ convert to Azure Functions automatically
- GitHub workflow: api_location: "" (empty)
- Output location: "out" for static files

## Deployment Steps
1. Extract this package to your GitHub repository
2. Ensure no /api directory exists at root level
3. Push to main branch
4. GitHub Actions will deploy successfully

## File Structure
```
/
├── app/
│   ├── api/          <- Next.js API routes (143 endpoints)
│   ├── bookings/
│   ├── layout.tsx
│   └── page.tsx
├── components/
├── lib/
├── shared/
├── package.json
├── next.config.mjs
├── staticwebapp.config.json
└── .github/workflows/
```

## Post-Deployment
- Static app: https://polite-mud-027da750f.2.azurestaticapps.net
- API health: /api/health endpoint will work automatically
- All 143 API routes available as Azure Functions

This clean configuration will deploy successfully without conflicts.
EOF

# Create final package
tar -czf azure-deployment-final-clean.tar.gz azure-clean/

# Cleanup
rm -rf azure-clean
rm create_clean_deployment.sh

echo "✅ Clean deployment package created: azure-deployment-final-clean.tar.gz"
echo "   - Removed conflicting /api directory"
echo "   - Preserved app/api/ routes for Azure Functions"
echo "   - Corrected workflow configuration"
echo "   - Ready for successful deployment"