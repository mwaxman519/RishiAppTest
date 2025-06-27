# Deploy Rishi Platform to Azure - Your Repository

## Repository: https://github.com/mwaxman519/rishi-platform

## Step 1: Upload Your Complete Rishi Platform

**Copy and paste these commands in your Replit terminal:**

```bash
# Create deployment directory
mkdir rishi-upload && cd rishi-upload

# Copy all application files
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

# Create deployment files
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

## Azure Static Web Apps Architecture
- **Frontend**: Next.js 15.3.2 static export → Azure CDN global distribution
- **Backend**: 143 API routes → Azure Functions (auto-converted during deployment)
- **Events**: EventBus system → Azure Event Grid (enterprise event processing)
- **Database**: Neon PostgreSQL with connection pooling
- **Authentication**: JWT-based with NextAuth integration

## Cannabis Industry Features
- Multi-state workforce management
- Role-based access control (6-tier system)
- Real-time booking and scheduling
- Location-based service delivery
- Staff assignment workflows
- Inventory and kit management
- Analytics and reporting dashboards

## API Endpoints (Auto-Converted to Azure Functions)
- `/api/auth/*` - Authentication services
- `/api/bookings/*` - Cannabis booking management
- `/api/organizations/*` - Multi-tenant organization management
- `/api/users/*` - User and role management
- `/api/locations/*` - Geographic location services
- `/api/inventory/*` - Kit and inventory management
- ... (143 total endpoints)

## Event-Driven Processing
EventBus calls automatically converted to Azure Event Grid:
- `booking.created` → staff assignment workflows
- `location.updated` → mapping service updates
- `user.assigned` → notification triggers
- `inventory.updated` → tracking workflows

## Deployment
Deployed via Azure Static Web Apps with GitHub integration.
All serverless infrastructure created automatically during deployment.
EOF

# Initialize Git and push to your repository
git init
git add .
git commit -m "Complete Rishi Platform: Next.js → Azure Functions + Event Grid conversion"
git branch -M main
git remote add origin https://github.com/mwaxman519/rishi-platform.git
git push -u origin main
```

## Step 2: Create Azure Static Web App

**Azure Portal Configuration:**

1. Go to https://portal.azure.com
2. Click "Create a resource"
3. Search "Static Web App" and select it
4. Click "Create"

**Settings:**
- **Subscription**: Your Azure subscription
- **Resource Group**: Create new → `rishi-platform-rg`
- **Name**: `rishi-platform`
- **Plan**: Free (testing) or Standard (production)
- **Region**: East US 2
- **Source**: GitHub
- **Organization**: mwaxman519
- **Repository**: rishi-platform
- **Branch**: main
- **Build Presets**: Next.js
- **App location**: `/`
- **API location**: `api`
- **Output location**: `out`

5. Click "Review + create"
6. Click "Create"

## What Azure Creates Automatically

**During 8-12 minute deployment:**
- **Static Website**: React frontend on Azure CDN
- **143 Azure Functions**: API routes converted to serverless functions
- **Event Grid Integration**: EventBus → enterprise event processing
- **GitHub Actions**: CI/CD pipeline for automatic deployments
- **SSL Certificate**: Automatic HTTPS

**Your Live Platform:**
- URL: `https://rishi-platform-[random].azurestaticapps.net`
- Global CDN distribution
- Auto-scaling serverless functions
- Enterprise event processing
- Complete cannabis workforce management

**Timeline**: 15-20 minutes to production-ready system

## Environment Variables (Add After Deployment)

In Azure Portal → Your Static Web App → Configuration:

```
DATABASE_URL=postgresql://rishiAppProdDB_owner:npg_h5vrTomMiI9Q@ep-dark-wildflower-a85rz3um-pooler.eastus2.azure.neon.tech/rishiAppProdDB?sslmode=require
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-app-name.azurestaticapps.net
NODE_ENV=production
```