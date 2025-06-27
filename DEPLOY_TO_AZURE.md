# EXECUTE THIS TO FINISH AZURE DEPLOYMENT

## Push optimized Rishi Platform to Azure Static Web Apps

```bash
# Navigate to a clean directory
mkdir -p /tmp/azure-deploy
cd /tmp/azure-deploy

# Clone and configure repository
git clone https://github.com/mwaxman519/RishiAppTest.git
cd RishiAppTest

# Copy optimized files from workspace
cp -r /home/runner/workspace/.github .
cp /home/runner/workspace/next.config.mjs .
cp /home/runner/workspace/oryx.ini .
cp /home/runner/workspace/.nojekyll .
cp /home/runner/workspace/.nvmrc .
cp /home/runner/workspace/.gitignore .
cp /home/runner/workspace/package.json .
cp /home/runner/workspace/package-lock.json .
cp -r /home/runner/workspace/app .
cp -r /home/runner/workspace/components .
cp -r /home/runner/workspace/lib .
cp -r /home/runner/workspace/shared .
cp -r /home/runner/workspace/types .
cp -r /home/runner/workspace/public .
cp -r /home/runner/workspace/config .
cp -r /home/runner/workspace/contexts .
cp -r /home/runner/workspace/middleware .
cp -r /home/runner/workspace/services .
cp /home/runner/workspace/tailwind.config.js .
cp /home/runner/workspace/postcss.config.mjs .
cp /home/runner/workspace/tsconfig.json .
cp /home/runner/workspace/staticwebapp.config.json .

# Remove Python files to prevent platform detection
find . -name "*.py" -delete
find . -name "*.php" -delete
rm -rf .cache/uv/
rm -rf __pycache__/

# Stage and commit changes
git add -A
git commit -m "Azure deployment: OIDC auth + Python detection fix + optimized build"

# Push to trigger Azure deployment
git push origin main
```

## Azure will automatically deploy to: https://yellow-rock-0a390fd10.1.azurestaticapps.net

**Critical fixes included:**
✅ OIDC authentication with GitHub tokens
✅ Python cache cleanup to prevent multi-platform detection  
✅ webpack optimization for Azure 244KB limits
✅ All 143 API routes → Azure Functions conversion