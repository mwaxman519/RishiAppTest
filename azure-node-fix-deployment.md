# Azure Node.js Version Fix - Deployment Instructions

## Issue Identified
Azure Oryx build system using Node.js 22.15.0 causing compatibility failures with Rishi Platform dependencies.

## Solution Implemented
1. **Node.js Version Constraint**: Created .nvmrc with Node.js 18.20.4
2. **GitHub Workflow Update**: Added explicit Node.js setup in Azure deployment workflow
3. **Build Optimization**: Maintained Next.js static export configuration

## Files Created/Modified
- `.nvmrc` - Forces Node.js 18.20.4 for Azure builds
- `.github/workflows/azure-static-web-apps-yellow-rock-0a390fd10.yml` - Updated with Node.js setup
- `next.config.mjs` - Already optimized for Azure static export

## Manual Push Required
Due to Git restrictions in Replit environment, these files need manual deployment:

```bash
# Copy files to local system and push to GitHub
git add .nvmrc .github/workflows/azure-static-web-apps-yellow-rock-0a390fd10.yml
git commit -m "Fix Azure Node.js version constraint to 18.20.4"
git push origin main
```

## Expected Result
Azure build will now use stable Node.js 18.20.4 instead of problematic 22.15.0, allowing progression to next build phase.