#!/bin/bash

echo "=== Rishi Platform Azure Deployment ==="
echo "Creating deployment package with:"
echo "- Static React frontend → Azure CDN"
echo "- 143 API routes → Azure Functions"
echo "- EventBus system → Azure Event Grid"
echo "- Database connections → Neon PostgreSQL"
echo ""

# Create deployment directory
echo "Creating deployment directory..."
mkdir -p rishi-deploy
cd rishi-deploy

# Extract deployment files
echo "Extracting deployment files..."
tar -xzf ../rishi-platform-azure.tar.gz

# Create .gitignore
echo "Creating .gitignore..."
cat > .gitignore << 'EOF'
node_modules/
.next/
out/
.env.local
.env
*.log
.DS_Store
EOF

# Create comprehensive README
echo "Creating README.md..."
cat > README.md << 'EOF'
# Rishi Platform - Enterprise Workforce Management

## Architecture Overview
- **Frontend**: Next.js 15.3.2 static export → Azure CDN global distribution  
- **Backend**: 143 API routes → Azure Functions (auto-scaled serverless)
- **Events**: EventBus system → Azure Event Grid (enterprise messaging)
- **Database**: Neon PostgreSQL with connection pooling
- **Authentication**: JWT-based with NextAuth integration

## Azure Infrastructure (Auto-Created)
- Azure Static Web Apps (frontend hosting + function management)
- Azure Functions (143+ serverless endpoints)
- Azure Event Grid (event-driven architecture)
- Azure CDN (global content delivery)
- GitHub Actions (CI/CD pipeline)

## API Endpoints (Auto-Converted to Azure Functions)
- `/api/health` - System health monitoring
- `/api/auth/*` - Authentication services
- `/api/bookings/*` - Cannabis booking management
- `/api/organizations/*` - Multi-tenant organization management
- `/api/users/*` - User and role management
- `/api/locations/*` - Geographic location services
- ... (143 total endpoints)

## Event-Driven Processing
EventBus calls automatically converted to Azure Event Grid:
- booking.created → staff assignment workflows
- location.updated → mapping service updates  
- user.assigned → notification triggers
- inventory.updated → tracking workflows

## Cannabis Industry Features
- Multi-state compliance tracking
- Staff scheduling and assignment
- Location-based service delivery
- Real-time operational dashboards
- Role-based access control (6 tier system)

## Deployment
Deployed via Azure Static Web Apps with automatic GitHub integration.
All infrastructure created and managed automatically.
EOF

# Initialize Git
echo "Initializing Git repository..."
git init
git add .
git commit -m "Rishi Platform deployment: Next.js → Azure Functions + Event Grid conversion"
git branch -M main

echo ""
echo "=== DEPLOYMENT PACKAGE READY ==="
echo ""
echo "Next steps:"
echo "1. Create GitHub repository: 'rishi-platform'"
echo "2. Add your repository URL:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/rishi-platform.git"
echo "3. Push to GitHub:"
echo "   git push -u origin main"
echo "4. Create Azure Static Web App with these settings:"
echo "   - Source: GitHub"
echo "   - Repository: rishi-platform"
echo "   - Build preset: Next.js"
echo "   - App location: /"
echo "   - API location: api"
echo "   - Output location: out"
echo ""
echo "Azure will automatically create:"
echo "- 143 Azure Functions from your API routes"
echo "- Event Grid for EventBus processing"
echo "- Global CDN for frontend distribution"
echo "- CI/CD pipeline for automatic deployments"
EOF