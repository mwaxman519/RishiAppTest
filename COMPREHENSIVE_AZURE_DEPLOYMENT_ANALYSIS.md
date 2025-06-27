# Comprehensive Azure Deployment Analysis for Rishi Platform

## Current Architecture Assessment

### Frontend Structure
- **Framework**: Next.js 15.3.2 with App Router
- **Pages**: 50+ pages including dashboard, bookings, organizations, users, etc.
- **Components**: Complex UI with Shadcn/UI, Tailwind CSS, and custom components
- **State Management**: React Context for auth, organization switching, RBAC

### Backend Structure  
- **API Routes**: 143+ endpoints in `/app/api/` directory
- **Database**: Drizzle ORM with Neon PostgreSQL
- **Authentication**: JWT-based with NextAuth integration
- **Services**: EventBusService, RBAC, organization management

### Key API Endpoints Analysis
```
/api/auth/* - Authentication & sessions
/api/organizations/* - Multi-tenant organization management  
/api/users/* - User management with RBAC
/api/bookings/* - Core booking management
/api/locations/* - Location services with Google Maps
/api/shifts/* - Shift scheduling and assignments
/api/availability/* - Staff availability management
/api/analytics/* - Reporting and analytics
/api/rbac/* - Role-based access control
```

## Correct Azure Architecture

### Option 1: Azure Static Web Apps + Managed Functions + Event Grid
**Frontend**: Next.js static export (`output: 'export'`)
- Static HTML/CSS/JS deployed to Azure CDN
- Client-side React routing 
- API calls to managed Azure Functions

**Backend**: Azure Static Web Apps Managed Functions
- Azure Functions for API endpoints
- Integrated deployment via GitHub Actions
- Shared authentication and CORS handling

**Event System**: Azure Event Grid Integration
- EventBusService publishes to Azure Event Grid
- Event-driven microservices communication
- Real-time updates and notifications
- Audit trail and system monitoring

**Configuration**:
```yaml
# .github/workflows/azure-static-web-apps-*.yml
app_location: "/"
api_location: "api"  # Points to /api directory (separate from /app/api)
output_location: "out"
```

```js
// next.config.mjs
{
  output: 'export',
  trailingSlash: false,
  images: { unoptimized: true }
}
```

### Option 2: Separate Azure Functions App (Recommended)
**Frontend**: Azure Static Web Apps (Static only)
- Next.js static export for maximum performance
- No API routes in frontend deployment
- Calls separate Azure Functions via HTTPS

**Backend**: Dedicated Azure Functions App
- Independent scaling and deployment
- Full Node.js/TypeScript support
- Direct Neon PostgreSQL connections
- Custom CORS and authentication

## Implementation Plan

### Phase 1: Azure Event Grid Integration
1. **EventBusService → Event Grid Adapter**
   - Create Azure Event Grid client for publishing events
   - Implement Azure Service Bus adapter (already exists in code)
   - Configure event schemas for cannabis booking workflows
   - Set up topic partitioning for high-throughput events

2. **Event Grid Topic Configuration**
   - `rishi-bookings` - Booking lifecycle events
   - `rishi-staff` - Staff assignment and scheduling  
   - `rishi-organization` - Multi-tenant organization events
   - `rishi-rbac` - Permission and access control events
   - `rishi-analytics` - Reporting and analytics events

### Phase 2: Azure Functions with Event Grid
1. **Convert API Routes to Event-Driven Functions**
   - HTTP trigger functions for frontend API calls
   - Event Grid trigger functions for event processing
   - Timer trigger functions for scheduled operations
   - Implement existing EventBusService patterns

2. **Event Processing Pipeline**
   ```
   Frontend → HTTP Function → Event Grid → Processing Functions → Database
                                     ↓
                              Event Handlers → Notifications/Analytics
   ```

### Phase 3: Static Web App Deployment
1. Configure Next.js static export with Azure Functions backend
2. Set up Azure Event Grid custom topics and subscriptions
3. Deploy Event Grid webhooks for real-time frontend updates
4. Configure SignalR for live notifications

### Phase 4: Production Infrastructure
1. **Event Grid Configuration**
   - Dead letter queues for failed events
   - Event filtering and routing rules
   - Retry policies and exponential backoff
   - Event schema validation

2. **Monitoring & Observability**
   - Application Insights for event tracing
   - Event Grid metrics and alerting
   - Custom dashboards for cannabis operations
   - Audit trails through Event Grid logs

## Required Code Changes

### Frontend Changes
```typescript
// Replace internal API calls
// OLD: await fetch('/api/bookings')
// NEW: await fetch('https://rishi-functions.azurewebsites.net/api/bookings')

// Environment configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://rishi-functions.azurewebsites.net'
```

### Backend Changes
```typescript
// Convert Next.js API route to Azure Function
// FROM: app/api/bookings/route.ts
// TO: functions/bookings/index.ts

import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { db } from "../lib/db"

const httpTrigger: AzureFunction = async (context: Context, req: HttpRequest): Promise<void> => {
  // Implementation
}

export default httpTrigger
```

## Database Configuration
- **Connection**: Neon PostgreSQL with connection pooling
- **Environment Variables**: Stored in Azure Functions app settings
- **Schema**: Existing Drizzle ORM schema maintained

## Authentication Strategy
- **JWT Tokens**: Issued by Azure Functions
- **CORS**: Configure Functions to allow Static Web App domain
- **Sessions**: Stateless JWT-based authentication

## Cost Optimization
- **Static Web App**: ~$0/month (free tier)
- **Azure Functions**: Pay-per-execution model
- **Database**: Existing Neon PostgreSQL costs
- **CDN**: Global distribution included

## Security Considerations
- **HTTPS**: Enforced on both Static Web App and Functions
- **CORS**: Restrictive policy allowing only frontend domain
- **Environment Variables**: Secured in Azure Key Vault
- **API Keys**: Stored in Azure Functions configuration

## Monitoring & Logging
- **Application Insights**: For Functions monitoring
- **Static Web Apps**: Built-in analytics
- **Database**: Neon PostgreSQL monitoring
- **Custom Logging**: EventBusService integration

This architecture provides scalability, cost-effectiveness, and proper separation of concerns while maintaining all existing Rishi Platform functionality.