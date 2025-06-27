# Azure Deployment Token Fix Required

## Issue Identified
The Azure deployment failed with error:
```
No matching Static Web App was found or the api key was invalid.
```

## Root Cause
Your GitHub repository is using an incorrect deployment token. The workflow expects:
`AZURE_STATIC_WEB_APPS_API_TOKEN_SALMON_WAVE_08EA45710`

But your repository likely has a different token configured.

## Solution Required
Add the correct deployment token to GitHub repository secrets:

1. **Go to GitHub Repository Settings**
   - Navigate to: https://github.com/mwaxman519/RishiAppTest/settings/secrets/actions

2. **Add New Repository Secret**
   - Name: `AZURE_STATIC_WEB_APPS_API_TOKEN_SALMON_WAVE_08EA45710`
   - Value: `385bf88f9fb04f7bb58a2ccb76ac60722a4205a097494bbcaa4d881349c36a2002-52b040d7-f5ad-4b1f-94db-c2164d9bd490010112308ea45710`

3. **Trigger New Deployment**
   - Push any commit to main branch to restart deployment

## Current Status
- Workflow configuration: ✅ Fixed for Next.js static export
- Next.js configuration: ✅ Updated with distDir: 'out'
- Database imports: ✅ Fixed schema paths
- **Deployment token: ❌ Needs to be added to GitHub secrets**

Once the token is added, your Rishi Platform will deploy successfully to Azure.