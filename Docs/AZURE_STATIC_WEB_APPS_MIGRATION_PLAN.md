# Azure Static Web Apps Migration Plan - Rishi Platform

## Executive Summary

This document provides a comprehensive migration plan to deploy the Rishi Platform from Replit Autoscale to Azure Static Web Apps with Azure Functions and Event Grid integration. The plan addresses the architectural transformation required for serverless deployment while maintaining full cannabis workforce management functionality.

## Current State Analysis

### Existing Architecture (Replit Autoscale)
- **Next.js 15.3.2**: Full-stack application with API routes
- **Storage**: 1.8GB optimized footprint
- **API Routes**: 143 endpoints in `/app/api/*`
- **Database**: Neon PostgreSQL with connection pooling
- **EventBus**: In-memory event processing
- **Dependencies**: 149 production packages

### Target Architecture (Azure Static Web Apps)
- **Static Frontend**: Next.js static export served via Azure CDN
- **Serverless Backend**: API routes converted to Azure Functions
- **Event Processing**: Azure Event Grid for microservices communication
- **Database**: Neon PostgreSQL with Azure Functions integration
- **Global Distribution**: Multi-region deployment with Azure Front Door

## Phase 1: Static Frontend Preparation

### Next.js Configuration Update
```javascript
// next.config.azure.mjs
const nextConfig = {
  output: 'export',
  trailingSlash: false,
  images: {
    unoptimized: true,
    loader: 'custom',
    loaderFile: './lib/imageLoader.js'
  },
  experimental: {
    esmExternals: 'loose'
  },
  typescript: {
    ignoreBuildErrors: false
  },
  eslint: {
    ignoreDuringBuilds: false
  }
};

export default nextConfig;
```

### Build Script Optimization
```json
{
  "scripts": {
    "build:azure": "next build",
    "build:static": "npm run build:azure",
    "export": "echo 'Export handled by Next.js 15+'",
    "deploy:azure": "npm run build:static"
  }
}
```

### Static Export Requirements
- **Image Optimization**: Disabled for static compatibility
- **Dynamic Routes**: Pre-generated at build time
- **API Route Conversion**: Removed from static build, moved to Azure Functions
- **Asset Management**: Optimized for Azure CDN distribution

## Phase 2: Azure Functions Migration

### Function Structure Conversion
```
api/
├── auth/
│   ├── login.js          # POST /api/auth/login
│   ├── session.js        # GET /api/auth/session
│   └── logout.js         # POST /api/auth/logout
├── bookings/
│   ├── index.js          # GET /api/bookings
│   ├── create.js         # POST /api/bookings
│   └── [id].js          # GET/PUT/DELETE /api/bookings/{id}
├── staff/
│   ├── managers.js       # Staff management endpoints
│   ├── assignments.js    # Staff assignment logic
│   └── availability.js   # Availability tracking
└── organizations/
    ├── index.js          # Organization management
    ├── users.js          # Organization user management
    └── settings.js       # Organization configuration
```

### Azure Function Template
```javascript
// api/bookings/index.js
const { app } = require('@azure/functions');
const { neon } = require('@neondatabase/serverless');

app.http('bookings', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  route: 'bookings',
  handler: async (request, context) => {
    try {
      const sql = neon(process.env.DATABASE_URL);
      
      if (request.method === 'GET') {
        const bookings = await sql`
          SELECT * FROM bookings 
          WHERE organization_id = ${organizationId}
          ORDER BY created_at DESC
        `;
        return { 
          status: 200,
          jsonBody: bookings,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        };
      }
      
      if (request.method === 'POST') {
        const booking = await request.json();
        const result = await sql`
          INSERT INTO bookings (id, title, client_id, organization_id)
          VALUES (${booking.id}, ${booking.title}, ${booking.clientId}, ${booking.organizationId})
          RETURNING *
        `;
        
        // Publish to Event Grid
        await publishToEventGrid({
          eventType: 'booking.created',
          data: result[0],
          subject: `bookings/${result[0].id}`
        });
        
        return { 
          status: 201,
          jsonBody: result[0]
        };
      }
    } catch (error) {
      context.log.error('Booking operation failed:', error);
      return { 
        status: 500,
        jsonBody: { error: 'Internal server error' }
      };
    }
  }
});
```

### Database Integration
```javascript
// lib/database.js - Shared database utilities
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL, {
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000
});

async function withTransaction(callback) {
  return await sql.transaction(callback);
}

module.exports = { sql, withTransaction };
```

## Phase 3: Event Grid Integration

### Event Grid Topic Configuration
```json
{
  "name": "rishi-platform-events",
  "location": "East US 2",
  "properties": {
    "inputSchema": "EventGridSchema",
    "publicNetworkAccess": "Enabled"
  }
}
```

### Event Publishing Service
```javascript
// lib/eventGrid.js
const { EventGridPublisherClient } = require('@azure/eventgrid');

const client = new EventGridPublisherClient(
  process.env.EVENTGRID_ENDPOINT,
  new AzureKeyCredential(process.env.EVENTGRID_ACCESS_KEY)
);

async function publishToEventGrid(event) {
  const eventData = {
    id: generateUUID(),
    source: 'rishi-platform',
    specversion: '1.0',
    type: event.eventType,
    subject: event.subject,
    time: new Date().toISOString(),
    data: event.data
  };
  
  await client.send([eventData]);
}

module.exports = { publishToEventGrid };
```

### Event Subscribers
```javascript
// api/events/booking-handler.js
app.eventGridTrigger('bookingEventHandler', {
  source: 'rishi-platform',
  subject: 'bookings/*',
  handler: async (event, context) => {
    const { type, data } = event;
    
    switch (type) {
      case 'booking.created':
        await handleBookingCreated(data);
        break;
      case 'booking.updated':
        await handleBookingUpdated(data);
        break;
      case 'booking.cancelled':
        await handleBookingCancelled(data);
        break;
    }
  }
});
```

## Phase 4: Infrastructure as Code

### Azure Resources Definition
```yaml
# azure-resources.yml
resources:
  - type: Microsoft.Web/staticSites
    name: rishi-platform-static
    properties:
      repositoryUrl: https://github.com/user/rishi-platform
      branch: main
      buildProperties:
        appLocation: '/'
        apiLocation: 'api'
        outputLocation: 'out'
        
  - type: Microsoft.EventGrid/topics
    name: rishi-platform-events
    location: East US 2
    
  - type: Microsoft.Storage/storageAccounts
    name: rishiplatformstorage
    kind: StorageV2
    sku: Standard_LRS
    
  - type: Microsoft.KeyVault/vaults
    name: rishi-platform-secrets
    properties:
      accessPolicies:
        - permissions:
            secrets: ['get', 'list']
          principalId: '{static-web-app-principal-id}'
```

### GitHub Actions Workflow
```yaml
# .github/workflows/azure-static-web-apps.yml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true
          
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build application
        run: npm run build:azure
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
          
      - name: Deploy to Azure Static Web Apps
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: 'upload'
          app_location: '/'
          api_location: 'api'
          output_location: 'out'
```

## Phase 5: Configuration Management

### Static Web App Configuration
```json
{
  "routes": [
    {
      "route": "/api/*",
      "allowedRoles": ["authenticated"]
    },
    {
      "route": "/admin/*",
      "allowedRoles": ["super_admin", "internal_admin"]
    },
    {
      "route": "/dashboard/*",
      "allowedRoles": ["authenticated"]
    }
  ],
  "responseOverrides": {
    "401": {
      "redirect": "/auth/login",
      "statusCode": 302
    }
  },
  "globalHeaders": {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Content-Security-Policy": "default-src 'self' https://*.azure.com"
  },
  "mimeTypes": {
    ".json": "application/json"
  }
}
```

### Environment Variables
```bash
# Azure Static Web Apps Configuration
DATABASE_URL=postgresql://user:pass@ep-xxx.azure.neon.tech/db
NEXTAUTH_SECRET=your-secret-key
EVENTGRID_ENDPOINT=https://rishi-platform-events.eastus2-1.eventgrid.azure.net
EVENTGRID_ACCESS_KEY=your-access-key
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;...
```

## Phase 6: Testing Strategy

### Integration Testing
```javascript
// tests/integration/azure-functions.test.js
describe('Azure Functions Integration', () => {
  test('Booking creation triggers Event Grid', async () => {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(testBooking)
    });
    
    expect(response.status).toBe(201);
    
    // Verify Event Grid event was published
    const events = await getEventGridEvents();
    expect(events).toContainEqual(
      expect.objectContaining({
        type: 'booking.created',
        subject: `bookings/${testBooking.id}`
      })
    );
  });
});
```

### Performance Testing
```javascript
// tests/performance/load-test.js
import { check } from 'k6';
import http from 'k6/http';

export let options = {
  vus: 100,
  duration: '5m',
};

export default function() {
  let response = http.get('https://rishi-platform.azurestaticapps.net/api/bookings');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

## Migration Timeline

### Week 1: Preparation
- [ ] Static export configuration
- [ ] Azure resource provisioning
- [ ] GitHub Actions setup
- [ ] Environment variable migration

### Week 2: Function Migration
- [ ] Convert 143 API routes to Azure Functions
- [ ] Database connection optimization
- [ ] Authentication integration
- [ ] CORS configuration

### Week 3: Event Grid Integration
- [ ] Event Grid topic creation
- [ ] Event publishing implementation
- [ ] Event subscriber functions
- [ ] Audit trail verification

### Week 4: Testing & Deployment
- [ ] Integration testing
- [ ] Performance validation
- [ ] Security verification
- [ ] Production deployment

## Potential Blocking Issues

### Technical Challenges
1. **Cold Start Latency**: Azure Functions may experience cold starts affecting user experience
2. **Connection Pooling**: Database connections need optimization for serverless environment
3. **Event Grid Limits**: Event publishing rate limits may affect high-volume operations
4. **Static Export Limitations**: Some Next.js features may not work in static export mode

### Mitigation Strategies
1. **Premium Plan**: Use Azure Functions Premium plan for reduced cold starts
2. **Connection Management**: Implement connection pooling with @neondatabase/serverless
3. **Event Batching**: Batch events to reduce Event Grid API calls
4. **Feature Compatibility**: Audit and replace incompatible Next.js features

### Dependencies Requirements
- **Azure Subscription**: Active subscription with sufficient quotas
- **GitHub Repository**: Source code repository with Actions enabled  
- **Domain Configuration**: Custom domain setup for production
- **SSL Certificates**: Managed certificates through Azure

## Success Metrics

### Performance Targets
- **Page Load Time**: < 2 seconds for static pages
- **API Response Time**: < 500ms for database queries
- **Event Processing**: < 1 second for Event Grid publishing
- **Availability**: 99.9% uptime SLA

### Cost Optimization
- **Static Hosting**: ~$0/month for basic tier
- **Azure Functions**: Pay-per-execution model
- **Event Grid**: ~$0.60 per million events
- **Database**: Existing Neon PostgreSQL costs

This migration plan transforms the Rishi Platform into a globally distributed, serverless cannabis workforce management system leveraging Azure's cloud-native services while maintaining all existing functionality.