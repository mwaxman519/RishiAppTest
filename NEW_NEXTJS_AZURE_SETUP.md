# New Next.js Azure Static Web App Setup

## Issue Resolution
The current Azure Static Web App at salmon-wave-08ea45710.2.azurestaticapps.net was configured for React, not Next.js, which explains why deployments fail despite correct authentication.

## Solution: Create New Next.js-Specific Azure App

### Step 1: Create New Azure Static Web App
1. Go to Azure Portal → Static Web Apps → Create
2. **Configuration for Next.js**:
   - App details: Choose subscription and resource group
   - Static Web App details: Name (e.g., "rishi-platform-nextjs")
   - Deployment details:
     - Source: GitHub
     - Organization: mwaxman519
     - Repository: RishiAppTest
     - Branch: main
     - Build Presets: **Next.js** (Critical - not React)

### Step 2: Azure Will Auto-Generate Workflow
Azure will create a new workflow file like:
`.github/workflows/azure-static-web-apps-[new-name].yml`

### Step 3: Automatic Next.js Configuration
Azure will configure:
- **App location**: `/` 
- **API location**: `` (empty for Next.js API routes)
- **Output location**: `out` (for Next.js static export)
- **Build command**: `npm run build`

### Step 4: Environment Variables
Add to new Azure app settings:
- `DATABASE_URL`: Neon PostgreSQL connection string
- `NEXTAUTH_SECRET`: Authentication secret
- `NEXTAUTH_URL`: New Azure app URL

### Current Repository Status
- ✅ Next.js 15.3.2 with static export configured
- ✅ All 143 API routes ready for Azure Functions conversion
- ✅ Proper package.json build scripts
- ✅ Static web app configuration files

### Benefits of New Next.js App
- Proper Next.js build pipeline
- Automatic API routes → Azure Functions conversion
- Correct static export handling
- No legacy React configuration conflicts

The repository is fully ready for a new Next.js-specific Azure Static Web App deployment.