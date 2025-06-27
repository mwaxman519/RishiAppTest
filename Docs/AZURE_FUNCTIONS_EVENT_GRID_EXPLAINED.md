# Azure Functions & Event Grid Creation Process

## Current State: Hybrid Approach

You have TWO types of API endpoints that will become Azure Functions:

### 1. Traditional Azure Functions (in `/api` folder)
**What we built on Replit:**
```
api/
├── health/
│   ├── function.json    # Azure Function configuration
│   └── index.js         # Function code
├── bookings/
│   ├── function.json
│   └── index.js
└── host.json           # Global Azure Functions configuration
```

**How Azure converts these:**
- Azure Static Web Apps sees the `/api` folder
- Automatically deploys each subfolder as a separate Azure Function
- Uses `function.json` for HTTP triggers and bindings
- Deploys `index.js` as the function runtime code

### 2. Next.js API Routes (in `/app/api` folder)
**What we have on Replit:**
```
app/api/
├── auth/
│   └── route.ts         # Next.js API route
├── bookings/
│   └── route.ts
├── organizations/
│   └── route.ts
└── ... (143 total endpoints)
```

**How Azure converts these:**
- Azure Static Web Apps with Next.js preset automatically converts `app/api/*` routes
- Each `route.ts` file becomes an Azure Function
- Next.js API route handlers become Azure Function handlers
- Azure handles the conversion during build process

## Event Grid Integration

### Current EventBus (Replit Development)
Your EventBus currently runs in-memory for development:
```typescript
// shared/events.ts
export const EventBusService = {
  publish: (event) => {
    // In-memory event processing for development
    console.log('Event published:', event);
  }
};
```

### Event Grid Conversion Process

**Step 1: Azure Event Grid Topic Creation**
```bash
# Azure CLI commands (runs during Azure deployment)
az eventgrid topic create \
  --name rishi-platform-events \
  --resource-group rishi-platform-rg \
  --location eastus2
```

**Step 2: EventBus Service Conversion**
During Azure deployment, your EventBus gets converted:
```javascript
// Azure Functions version
const { EventGridPublisherClient } = require('@azure/eventgrid');

const client = new EventGridPublisherClient(
  process.env.EVENTGRID_ENDPOINT,
  process.env.EVENTGRID_ACCESS_KEY
);

async function publishToEventGrid(event) {
  await client.send([{
    id: event.correlationId,
    source: 'rishi-platform',
    specversion: '1.0',
    type: event.type,
    subject: event.subject,
    data: event.data
  }]);
}
```

**Step 3: Event Subscribers**
Your API routes that currently use EventBus become Event Grid subscribers:
```javascript
// api/events/booking-handler.js (created during deployment)
module.exports = async function (context, eventGridEvent) {
  const { type, data } = eventGridEvent.data;
  
  switch (type) {
    case 'booking.created':
      await handleBookingCreated(data);
      break;
    case 'staff.assigned':
      await handleStaffAssigned(data);
      break;
  }
};
```

## Deployment Transformation

### What Happens During Azure Deployment:

**Phase 1: Static Frontend**
- Next.js builds static export to `/out` folder
- Azure CDN serves static files globally
- Client-side React runs in browsers

**Phase 2: API Route Conversion**
- Azure detects Next.js preset
- Converts all 143 `app/api/*` routes to Azure Functions
- Each route becomes independently scalable serverless function

**Phase 3: Event Grid Setup**
- Azure creates Event Grid topic automatically
- EventBus calls get replaced with Event Grid publishing
- Event subscribers become separate Azure Functions

**Phase 4: Integration**
- Static frontend calls Azure Functions via `/api/*` endpoints
- Azure Functions publish events to Event Grid
- Event Grid triggers other Azure Functions for processing

## Current Deployment Package

Your `rishi-platform-azure.tar.gz` contains:

### Ready for Azure Conversion:
- **Static Frontend**: `app/` folder with Next.js components
- **API Routes**: 143 endpoints in `app/api/*` (auto-converted)
- **Azure Functions**: Basic functions in `api/` folder
- **Configuration**: `staticwebapp.config.json` for routing
- **Build Config**: `next.config.azure.mjs` for static export

### Missing (Added During Azure Deployment):
- Event Grid topic creation
- EventBus → Event Grid conversion
- Event subscriber functions
- Environment variable injection

## Timeline of Function Creation

**During GitHub Upload:**
- Source code uploaded to repository
- Azure Static Web Apps detects changes via GitHub webhook

**During Azure Build (3-5 minutes):**
1. Azure installs dependencies
2. Runs `next build` for static export
3. Converts `app/api/*` routes to Azure Functions
4. Deploys traditional Azure Functions from `api/` folder
5. Sets up Event Grid topic and subscriptions
6. Configures environment variables and routing

**Post-Deployment:**
- Static site available at `https://rishi-platform-xxx.azurestaticapps.net`
- Azure Functions available at `/api/*` endpoints
- Event Grid processing events between functions
- Full EventBus functionality preserved via Event Grid

Your current codebase is designed to work both ways:
- **Development**: In-memory EventBus on Replit
- **Production**: Event Grid integration on Azure

The deployment process handles the conversion automatically.