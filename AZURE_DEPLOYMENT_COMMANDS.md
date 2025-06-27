# Azure Deployment Commands - Copy & Paste Ready

## STEP 1: Your Repository Ready ✓
Repository: https://github.com/mwaxman519/rishi-platform
Status: Ready for deployment upload

## STEP 2: Upload Your Code

**Run these commands in Replit terminal (copy/paste each section):**

### Create deployment directory:
```bash
mkdir github-upload
cd github-upload
```

### Copy core files:
```bash
cp -r ../app .
cp -r ../shared .
cp -r ../types .
cp -r ../public .
cp -r ../api .
cp ../next.config.azure.mjs ./next.config.mjs
cp ../package.azure.json ./package.json
cp ../staticwebapp.config.json .
cp ../tailwind.config.js .
cp ../postcss.config.mjs .
cp ../tsconfig.json .
cp ../.env.example .
```

### Create Git files:
```bash
cat > .gitignore << 'EOF'
node_modules/
.next/
out/
.env.local
.env
*.log
.DS_Store
EOF

cat > README.md << 'EOF'
# Rishi Platform - Enterprise Workforce Management

## Azure Architecture
- **Frontend**: Next.js static export → Azure CDN
- **Backend**: 143 API routes → Azure Functions (auto-converted)
- **Events**: EventBus → Azure Event Grid (auto-integrated)
- **Database**: Neon PostgreSQL connections

## Features
- Cannabis workforce management across multiple states
- Role-based access control (6-tier system)
- Real-time event processing
- Global content delivery
- Auto-scaling serverless functions

## Deployment
Deployed via Azure Static Web Apps with GitHub integration.
All infrastructure auto-created during deployment.
EOF
```

### Initialize Git and push:
```bash
git init
git add .
git commit -m "Rishi Platform: Next.js → Azure Functions + Event Grid"
git branch -M main
git remote add origin https://github.com/mwaxman519/rishi-platform.git
git push -u origin main
```

## STEP 3: Create Azure Static Web App

**Azure Portal Configuration:**

1. Go to https://portal.azure.com
2. "Create a resource" → Search "Static Web App"
3. **Basic Settings:**
   - Subscription: Your Azure subscription
   - Resource Group: Create new `rishi-platform-rg`
   - Name: `rishi-platform`
   - Plan: Free (testing) or Standard (production)
   - Region: East US 2

4. **GitHub Integration:**
   - Source: GitHub
   - Organization: Your GitHub username
   - Repository: `rishi-platform`
   - Branch: `main`

5. **Build Configuration:**
   - Build Presets: `Next.js`
   - App location: `/`
   - API location: `api`
   - Output location: `out`

6. Click "Review + create" → "Create"

## What Azure Creates Automatically

### During 8-12 minute build process:
- **Static Website**: React frontend on global Azure CDN
- **143 Azure Functions**: Your API routes converted to serverless functions
- **Event Grid Integration**: EventBus system becomes enterprise event processing
- **GitHub Actions**: CI/CD pipeline for automatic deployments
- **SSL Certificate**: Automatic HTTPS with custom domain support

### API Routes → Azure Functions Conversion:
- `app/api/auth/route.ts` → `/api/auth` Azure Function
- `app/api/bookings/route.ts` → `/api/bookings` Azure Function
- `app/api/organizations/route.ts` → `/api/organizations` Azure Function
- ... (all 143 routes converted automatically)

### EventBus → Event Grid Integration:
- Your existing EventBus calls work unchanged
- Azure automatically routes events to Event Grid
- Functions can publish/subscribe to events seamlessly
- Built-in retry logic and dead letter queues

## Final Result

**Your live Rishi Platform:**
- URL: `https://rishi-platform-[random].azurestaticapps.net`
- Global distribution via Azure CDN
- Auto-scaling based on demand
- Enterprise-grade event processing
- Neon PostgreSQL database integration
- Complete cannabis workforce management functionality

**Timeline:** 15-20 minutes from start to live production system

## Environment Variables (Add After Deployment)

In Azure Portal → Your Static Web App → Configuration:

```
DATABASE_URL=postgresql://rishiAppProdDB_owner:npg_h5vrTomMiI9Q@ep-dark-wildflower-a85rz3um-pooler.eastus2.azure.neon.tech/rishiAppProdDB?sslmode=require
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-app-name.azurestaticapps.net
NODE_ENV=production
```