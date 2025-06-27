# Azure Token Setup Instructions

## Current Status
✅ **New Azure Static Web App**: https://yellow-rock-0a390fd10.1.azurestaticapps.net  
✅ **Updated Workflow**: azure-static-web-apps-yellow-rock-0a390fd10.yml deployed to GitHub  
✅ **Configuration**: Perfect Next.js settings (app: "/", api: "", output: "out")  

## Required Action: Add GitHub Secret

The deployment token needs to be added as a GitHub repository secret:

**Secret Name:** `AZURE_STATIC_WEB_APPS_API_TOKEN_YELLOW_ROCK_0A390FD10`  
**Secret Value:** `44f1abfd387c39858ff7b8e17642806a517bd15857c09ad9a5967ea7949bab7401-27838e6a-b1d1-48cd-9b83-4fd11936f19d01013180a390fd10`

### Steps to Add Secret:
1. Go to: https://github.com/mwaxman519/RishiAppTest/settings/secrets/actions
2. Click "New repository secret"
3. Name: `AZURE_STATIC_WEB_APPS_API_TOKEN_YELLOW_ROCK_0A390FD10`
4. Value: Paste the token above
5. Click "Add secret"

## What Happens Next
Once the secret is added, the workflow will automatically trigger on the next push and deploy the Rishi Platform to:
- **Frontend**: Static files → Azure CDN
- **Backend**: 143 API routes → Individual Azure Functions
- **Database**: Neon PostgreSQL integration

The deployment is configured with the correct Next.js settings for automatic API route conversion.