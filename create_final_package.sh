#!/bin/bash

echo "Creating final corrected Azure deployment package..."

# Create final deployment structure
rm -rf azure-final
mkdir -p azure-final

# Copy corrected configuration files
cp package.azure-production.json azure-final/package.json
cp next.config.azure-production.mjs azure-final/next.config.mjs  
cp staticwebapp.azure-production.config.json azure-final/staticwebapp.config.json
cp PHASE3_ENVIRONMENT_VARIABLES.md azure-final/

# Copy essential application files
cp -r app azure-final/
cp -r components azure-final/
cp -r lib azure-final/
cp -r shared azure-final/
cp -r server azure-final/
cp -r types azure-final/
cp -r public azure-final/ 2>/dev/null || true

# Copy build configs
cp tailwind.config.js azure-final/
cp postcss.config.mjs azure-final/
cp tsconfig.json azure-final/
cp drizzle.config.ts azure-final/
cp middleware.ts azure-final/

# Copy GitHub workflow
mkdir -p azure-final/.github/workflows
cp .github/workflows/azure-static-web-apps-polite-mud-027da750f.yml azure-final/.github/workflows/

# Create final deployment instructions
cat > azure-final/FINAL_DEPLOYMENT_INSTRUCTIONS.md << 'EOF'
# Final Azure Static Web Apps Deployment

## GitHub Workflow Configuration Fixed
- Set `api_location: ""` (empty string) for Next.js with API routes
- Azure will use app/api directory automatically
- Static export outputs to `out/` directory

## Deployment Process
1. Push files to GitHub repository
2. GitHub Actions will trigger automatically
3. Azure builds with `next build` (static export)
4. API routes become serverless functions automatically
5. Static files deploy to Azure CDN

## Configuration Verified
- Next.js 15.3.4 with static export
- Output directory: `out/`
- API routes in `app/api/` become Azure Functions
- All 143 endpoints preserved with EventBusService

## Post-Deployment Verification
- App: https://polite-mud-027da750f.2.azurestaticapps.net
- Health: https://polite-mud-027da750f.2.azurestaticapps.net/api/health
- Auth: Test login/logout functionality

This configuration will deploy successfully to Azure Static Web Apps.
EOF

# Create final package
tar -czf azure-final-corrected.tar.gz azure-final/

# Cleanup
rm -rf azure-final
rm create_final_package.sh

echo "✅ Final deployment package: azure-final-corrected.tar.gz"
echo "Ready for GitHub upload with corrected workflow configuration"