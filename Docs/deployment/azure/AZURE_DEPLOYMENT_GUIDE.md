# Azure Production Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying the workforce management platform to Azure Static Web Apps for production use.

## Prerequisites
- Azure account with Static Web Apps creation permissions
- GitHub repository with the application code
- Production Neon Database instance
- Required environment secrets

## Step 1: Prepare Your Repository

Ensure your repository contains:
- ✅ `staticwebapp.config.json` (already created)
- ✅ `.github/workflows/azure-static-web-apps-production.yml` (already created)
- ✅ Production-ready Next.js application

## Step 2: Create Azure Static Web App

1. **Login to Azure Portal**
   - Go to https://portal.azure.com
   - Navigate to "Static Web Apps"

2. **Create New Static Web App**
   - Click "Create"
   - Select your subscription and resource group
   - Enter app name (e.g., "workforce-management-prod")
   - Choose "Free" or "Standard" plan
   - Select "GitHub" as deployment source

3. **Configure GitHub Integration**
   - Connect your GitHub account
   - Select organization: Your GitHub username/org
   - Select repository: Your repository name
   - Select branch: `main`

4. **Build Configuration**
   - App location: `/`
   - Api location: `app/api`
   - Output location: `out`

## Step 3: Configure Environment Variables

In Azure Portal → Your Static Web App → Configuration:

### Required Secrets
```
DATABASE_URL=postgresql://username:password@host/database
PRODUCTION_DATABASE_URL=postgresql://username:password@host/database
SESSION_SECRET=your-secure-session-secret-here
JWT_SECRET=your-secure-jwt-secret-here
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
```

### Optional Configuration
```
AZURE_STATIC_WEB_APPS_API_TOKEN=auto-generated-by-azure
LOG_LEVEL=warn
ENABLE_MOCK_DATA=false
```

## Step 4: Configure GitHub Secrets

In GitHub Repository → Settings → Secrets and Variables → Actions:

1. **AZURE_STATIC_WEB_APPS_API_TOKEN**
   - Found in Azure Portal → Your Static Web App → Overview
   - Copy the deployment token

2. **PRODUCTION_DATABASE_URL**
   - Your production Neon Database connection string

3. **SESSION_SECRET**
   - Generate: `openssl rand -base64 32`

4. **JWT_SECRET**
   - Generate: `openssl rand -base64 32`

## Step 5: Deploy

1. **Trigger Deployment**
   - Push changes to `main` branch
   - GitHub Actions will automatically build and deploy

2. **Monitor Deployment**
   - Check GitHub Actions tab for build status
   - Monitor Azure Portal for deployment progress

## Step 6: Post-Deployment Verification

### 1. Database Connection
- Verify database connectivity in Azure logs
- Check that tables are properly created

### 2. Application Functionality
- Test user authentication
- Verify API endpoints respond correctly
- Confirm no mock data is visible

### 3. Security Validation
- Verify HTTPS is enforced
- Check environment variables are secure
- Confirm no sensitive data in client-side code

## Troubleshooting

### Build Failures
- Check Node.js version compatibility (18.x required)
- Verify all dependencies are in package.json
- Review build logs in GitHub Actions

### Database Issues
- Verify connection string format
- Check database permissions
- Ensure database is accessible from Azure

### Environment Variables
- Confirm all required secrets are set
- Verify no typos in variable names
- Check Azure Configuration section

## Production Monitoring

- **Application Insights**: Enable for performance monitoring
- **Log Analytics**: Configure for centralized logging
- **Alerts**: Set up for critical metrics and errors

## Domain Configuration (Optional)

1. Purchase domain through Azure or external provider
2. Configure DNS settings
3. Add custom domain in Azure Static Web Apps
4. Configure SSL certificate (automatic with Azure)

Your application will be available at:
- Default: `https://your-app-name.azurestaticapps.net`
- Custom: `https://your-domain.com` (if configured)