# Azure Static Web Apps + Azure Functions Architecture Research

## Correct Architecture for Rishi Platform

### Azure Static Web Apps with Separate Azure Functions

**Frontend (Static Web App):**
- Next.js with `output: 'export'` → Creates static HTML/CSS/JS
- Deployed to Azure CDN for global distribution
- No server-side rendering, purely client-side React

**Backend (Azure Functions):**
- Separate Azure Functions app for API endpoints
- Independent deployment from frontend
- Can use Node.js, TypeScript, or other runtimes
- Database connections via Neon PostgreSQL

### Workflow Configuration:
```yaml
# Static Web App (Frontend only)
app_location: "/"
api_location: "" # Empty - no integrated API
output_location: "out" # Static export output
```

### Separate Azure Functions Structure:
```
/api (separate Azure Functions app)
├── locations/
│   └── index.ts (Azure Function)
├── bookings/
│   └── index.ts (Azure Function)
├── organizations/
│   └── index.ts (Azure Function)
└── host.json
```

## Implementation Plan

1. **Frontend**: Next.js static export for Azure Static Web Apps
2. **Backend**: Convert Next.js API routes to standalone Azure Functions
3. **Database**: Neon PostgreSQL connections in Azure Functions
4. **CORS**: Configure Azure Functions to allow Static Web App domain

This architecture provides:
- Better scaling (frontend/backend independent)
- Cost optimization (static hosting + serverless functions)
- Performance (CDN + edge functions)
- Proper separation of concerns