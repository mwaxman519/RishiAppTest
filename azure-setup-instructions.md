# Baby Steps: Deploy Rishi Platform to Azure Static Web Apps

## What We're Doing
Converting your optimized Rishi Platform (1.8GB, zero errors) into an Azure Static Web App with serverless functions.

## Step 1: Run the Deployment Script (Do This First)

In your Replit terminal, run:
```bash
./deploy-to-azure.sh
```

This script will:
- Test your current build
- Create an optimized deployment package
- Verify Azure compatibility
- Generate the `azure-deployment` folder

## Step 2: Create GitHub Repository

1. Go to https://github.com
2. Click "New repository"
3. Name it: `rishi-platform`
4. Make it Public
5. Don't initialize with README (we'll upload files)
6. Click "Create repository"

## Step 3: Upload Your Code

After the script runs, you'll have an `azure-deployment` folder. Upload ALL files from this folder to your new GitHub repository:

1. Click "uploading an existing file" on GitHub
2. Drag the entire contents of `azure-deployment` folder
3. Write commit message: "Initial Rishi Platform deployment"
4. Click "Commit changes"

## Step 4: Create Azure Static Web App

1. Go to https://portal.azure.com
2. Click "Create a resource"
3. Search "Static Web App" → Click "Create"

**Configuration:**
- Subscription: Your Azure subscription
- Resource Group: Create new → "rishi-platform-rg"
- Name: "rishi-platform"
- Plan type: Free
- Region: East US 2
- Source: GitHub

**GitHub Details:**
- Organization: Your GitHub username
- Repository: rishi-platform
- Branch: main

**Build Details:**
- Build preset: Next.js
- App location: /
- API location: api
- Output location: out

Click "Review + create" → "Create"

## Step 5: Monitor Deployment

After creation, Azure will:
1. Connect to your GitHub repo
2. Create a GitHub Actions workflow
3. Build and deploy your app (takes 3-5 minutes)

Watch the "GitHub Actions" tab in your repository for build progress.

## Step 6: Access Your Live App

Once deployment completes, you'll get a URL like:
`https://rishi-platform-xxx.azurestaticapps.net`

Your Rishi Platform will be live with:
- Static frontend served globally
- Health API endpoint at `/api/health`
- All your cannabis workforce management features

Ready to start? Run `./deploy-to-azure.sh` first!