# Deploy Rishi Platform to Azure - Quick Commands

## Step 1: Create GitHub Repository
1. Go to https://github.com
2. Click "New repository"
3. Name: `rishi-platform`
4. Make it Public
5. Don't initialize with README
6. Click "Create repository"
7. Copy your repository URL

## Step 2: Upload Code (Copy/Paste These Commands)

```bash
# Create deployment directory
mkdir rishi-deploy && cd rishi-deploy

# Extract files
tar -xzf ../rishi-platform-azure.tar.gz

# Create .gitignore
echo "node_modules/
.next/
out/
.env.local
.env
*.log" > .gitignore

# Create README
echo "# Rishi Platform
Enterprise workforce management platform

## Features
- 143 Azure Functions (auto-converted from Next.js API routes)
- Azure Event Grid integration
- Static frontend with Azure CDN
- Neon PostgreSQL database" > README.md

# Git setup
git init
git add .
git commit -m "Rishi Platform with Azure Functions and Event Grid"
git branch -M main

# Add YOUR repository URL here:
git remote add origin https://github.com/YOUR_USERNAME/rishi-platform.git
git push -u origin main
```

## Step 3: Create Azure Static Web App

**Azure Portal Settings:**
- Resource Group: Create new `rishi-platform-rg`
- Name: `rishi-platform`
- Source: GitHub
- Repository: `rishi-platform`
- Branch: `main`
- Build preset: `Next.js`
- App location: `/`
- API location: `api`
- Output location: `out`

## What Azure Creates Automatically
- **Static Website**: React frontend on Azure CDN
- **143 Azure Functions**: Your API routes become serverless functions
- **Event Grid**: EventBus system becomes enterprise event processing
- **CI/CD Pipeline**: GitHub Actions for automatic deployments
- **SSL Certificate**: Automatic HTTPS

## Timeline
- GitHub upload: 2-3 minutes
- Azure build & deployment: 8-12 minutes
- **Total**: 15-20 minutes to production

Your Rishi Platform will be live at: `https://rishi-platform-[random].azurestaticapps.net`