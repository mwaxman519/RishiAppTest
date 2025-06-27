# Get Azure Workflow Failure Information

## Method 1: GitHub Actions Tab (Fastest)
1. Go to https://github.com/mwaxman519/rishi-platform
2. Click the "Actions" tab
3. Click on the most recent failed workflow
4. Click on the failed job (usually "Build and Deploy Job")
5. Copy the entire log output and paste it here

## Method 2: Specific Error Messages
If the logs are long, look for these key sections and copy just these parts:
- **Build errors** (lines starting with "Error:" or "Failed")
- **Azure deployment errors** (lines mentioning "Azure Static Web Apps")
- **Package installation errors** (lines about npm install failures)
- **Configuration errors** (lines about missing files or invalid config)

## Method 3: Download Logs
1. In the failed workflow, click "Download log archive"
2. Extract the zip file
3. Copy the contents of the main log file

## What I Need to See
The most common Azure deployment failures are:
- **Build preset detection errors** (Next.js not recognized)
- **API location configuration issues** (api folder not found)
- **Output location problems** (build files in wrong directory)
- **Package.json dependency conflicts**
- **Environment variable issues**

## Quick Check Commands
If you have terminal access to your repository, you can also run:
```bash
# Check if Azure workflow file was created
ls -la .github/workflows/

# View the Azure workflow configuration
cat .github/workflows/azure-static-web-apps-*.yml
```

Once you paste the workflow logs, I can immediately identify the issue and provide the exact fix.