# Azure Functions Deployment Instructions

## API Functions Created

The cannabis workforce management platform now has Azure Functions:

### `/api/health`
- Returns platform health status with database and authentication configuration
- Accessible at: https://icy-smoke-02dc9440f.6.azurestaticapps.net/api/health

### `/api/bookings` 
- Returns cannabis workforce booking operations data
- Includes authentic cannabis dispensary locations in CO, OR, WA
- Accessible at: https://icy-smoke-02dc9440f.6.azurestaticapps.net/api/bookings

## Deployment Process

1. **Push Azure Functions** to your repository:
   ```bash
   git add api/
   git add function.json
   git add staticwebapp.config.json
   git add next.config.mjs
   git commit -m "Add Azure Functions for cannabis workforce API"
   git push origin main
   ```

2. **Azure will automatically deploy** the functions alongside the static site

3. **Test endpoints** after deployment (2-3 minutes):
   ```bash
   curl https://icy-smoke-02dc9440f.6.azurestaticapps.net/api/health
   curl https://icy-smoke-02dc9440f.6.azurestaticapps.net/api/bookings
   ```

## Configuration Changes

- **next.config.mjs**: Added static export configuration
- **staticwebapp.config.json**: Added API routes with anonymous access
- **Azure Functions**: Created with proper function.json bindings

The cannabis workforce management platform will be fully operational with both frontend and API functionality once deployed.