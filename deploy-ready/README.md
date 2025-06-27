# Rishi Platform - Enterprise Workforce Management

## Azure Static Web Apps Architecture
- **Frontend**: Next.js 15.3.2 static export → Azure CDN global distribution
- **Backend**: 143 API routes → Azure Functions (auto-converted during deployment)
- **Events**: EventBus system → Azure Event Grid (enterprise event processing)
- **Database**: Neon PostgreSQL with connection pooling

## Cannabis Industry Features
- Multi-state workforce management
- Role-based access control (6-tier system)
- Real-time booking and scheduling
- Location-based service delivery
- Staff assignment workflows
- Inventory and kit management

## Deployment
Deployed via Azure Static Web Apps with GitHub integration.
All serverless infrastructure created automatically.
