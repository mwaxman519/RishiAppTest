# Azure Static Web Apps - Final Correct Architecture

## ⚠️ CRITICAL: This is the ONLY correct deployment architecture

### Architecture Overview
- **Single Application Deployment**: One Next.js app deployed to Azure Static Web Apps
- **Frontend**: Next.js static export (`output: 'export'`) → Azure CDN
- **Backend**: 143 Next.js API routes in `/app/api/*` → Automatically converted to individual Azure Functions
- **Database**: Neon PostgreSQL accessed from converted Azure Functions
- **Events**: EventBusService integrates with Azure Event Grid from functions

### Configuration (FINAL)
```yaml
# .github/workflows/azure-static-web-apps-icy-grass-0ebe51e10.yml
app_location: "/"
api_location: ""          # EMPTY - tells Azure to convert Next.js API routes
output_location: "out"
```

```js
// next.config.mjs
{
  output: 'export',        # Static export for frontend
  trailingSlash: false,
  images: { unoptimized: true }
}
```

### What Azure Does Automatically
```
Development (Replit):               Production (Azure):
/app/api/health/route.ts     →     Azure Function /api/health
/app/api/bookings/route.ts   →     Azure Function /api/bookings  
/app/api/organizations/route.ts →  Azure Function /api/organizations
... (all 143 API routes)     →     ... (143 individual Azure Functions)
```

### ❌ INCORRECT Architectures (DO NOT USE)
- ~~Separate Azure Functions App~~ 
- ~~Manual `/api` directory with function.json files~~
- ~~api_location: "api"~~
- ~~Multiple GitHub workflows~~

### Deployment Process
1. GitHub Actions triggers on push to main
2. Azure builds Next.js static export for frontend
3. Azure automatically converts each `/app/api/route.ts` to Azure Function
4. Static files deploy to Azure CDN
5. API Functions deploy as serverless functions
6. EventBusService events can integrate with Azure Event Grid

### URLs
- **Frontend**: https://icy-grass-0ebe51e10.1.azurestaticapps.net
- **API**: https://icy-grass-0ebe51e10.1.azurestaticapps.net/api/*

### Event Grid Integration
EventBusService in converted Azure Functions can publish to Azure Event Grid topics:
- `rishi-bookings` - Booking lifecycle events
- `rishi-staff` - Staff assignment and scheduling  
- `rishi-organization` - Multi-tenant organization events
- `rishi-rbac` - Permission and access control events
- `rishi-analytics` - Reporting and analytics events

This is the definitive architecture. Any deviation from this is incorrect.