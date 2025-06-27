# Manual Deployment Instructions for Cannabis Workforce Management Platform

## Files Ready for Deployment

The complete cannabis workforce management platform is configured for Azure Static Web Apps with:

### Key Configuration Changes Made:
- **next.config.mjs**: Set to `output: 'standalone'` for middleware support
- **staticwebapp.config.json**: Updated API routing for Azure Functions
- **Azure Functions**: Created `/api/health` and `/api/bookings` endpoints
- **Environment Variables**: Already configured in your Azure portal

### Manual Deployment Steps:

1. **Download the deployment package** (cannabis-workforce-azure-deployment.tar.gz)

2. **Extract and push to your repository**:
   ```bash
   # Navigate to your local git repository
   cd path/to/mwaxman519/rishiapptest
   
   # Extract the deployment files
   tar -xzf cannabis-workforce-azure-deployment.tar.gz
   
   # Add all files
   git add .
   
   # Commit with deployment message
   git commit -m "Deploy: Next.js standalone with Azure Functions for cannabis workforce platform"
   
   # Push to trigger Azure deployment
   git push origin main
   ```

3. **Azure will automatically deploy** (2-3 minutes)

4. **Test the deployment**:
   ```bash
   curl https://icy-smoke-02dc9440f.6.azurestaticapps.net/api/health
   curl https://icy-smoke-02dc9440f.6.azurestaticapps.net/api/bookings
   ```

## Expected Results After Deployment:

- **Frontend**: Cannabis workforce management interface at root URL
- **API Health**: Returns platform status with database/auth configuration
- **API Bookings**: Returns authentic cannabis dispensary operational data
- **Middleware**: Full authentication and routing functionality
- **Navigation**: All Events replaced with Bookings, no 404 errors

The platform will be fully operational for cannabis workforce management across CO, OR, WA states.