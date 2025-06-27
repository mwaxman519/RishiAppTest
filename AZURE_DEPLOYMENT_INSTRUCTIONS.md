# Azure Static Web Apps Deployment Instructions

## Updated Configuration

Your Azure workflow needs these changes for Next.js static export + Azure Functions:

### 1. Update Workflow File
Replace the existing workflow with this configuration:

```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches: [main]
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches: [main]

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - name: Build And Deploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_SALMON_WAVE_08EA45710 }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          api_location: ""
          output_location: "out"
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
          NEXTAUTH_URL: "https://salmon-wave-08ea45710.2.azurestaticapps.net"
```

### 2. Deploy Complete Rishi Platform
Push all application files to root directory:
- All `/app` directories with API routes
- Complete component structure
- Database configuration files
- Package.json with Next.js dependencies

### 3. Environment Variables
Set these secrets in GitHub repository settings:
- `DATABASE_URL` - Your Neon PostgreSQL connection string
- `NEXTAUTH_SECRET` - JWT secret for authentication
- `AZURE_STATIC_WEB_APPS_API_TOKEN_SALMON_WAVE_08EA45710` - Already configured

## Architecture
- **Frontend**: Next.js static export → Azure CDN
- **Backend**: `/app/api/*` routes → Automatically converted to Azure Functions
- **Database**: Neon PostgreSQL accessed from Azure Functions
- **Events**: EventBusService ready for Azure Event Grid integration

Ready to deploy complete Rishi Platform with 143 API endpoints.