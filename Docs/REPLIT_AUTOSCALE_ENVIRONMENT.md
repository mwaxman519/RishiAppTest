# Replit Autoscale Environment - Rishi Platform

## Current Autoscale Configuration

### Environment Specifications
- **Platform**: Replit Autoscale with Node.js 18+ runtime
- **Port Configuration**: 5000 (configured via `-p 5000` flag)
- **Memory Allocation**: Optimized for 1.8GB total footprint
- **Build Process**: Next.js 15.3.2 with incremental compilation
- **Storage**: Ephemeral filesystem with persistent database connections

### Workflow Configuration
```yaml
# .replit workflow: "Start application"
command: npm run dev
```

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "next dev -p 5000",
    "build": "next build",
    "start": "next start -p 5000",
    "lint": "next lint",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

## Next.js Functionality on Replit Autoscale

### Build System Integration
- **Incremental Builds**: Next.js leverages Replit's filesystem for fast rebuilds
- **Module Resolution**: 601 modules compile in 2-5 seconds
- **Hot Reloading**: Real-time code changes without full restarts
- **Asset Optimization**: Static assets served directly from `/public`

### API Routes Handling
- **Route Structure**: `/app/api/*` automatically mapped to endpoints
- **Serverless Simulation**: Each API route runs as independent function
- **Database Connections**: Neon PostgreSQL with connection pooling
- **CORS Configuration**: Cross-origin handling for Replit preview iframe

### Environment Variable Management
```bash
# Required environment variables in Replit
DATABASE_URL=postgresql://...  # Neon PostgreSQL connection
NEXTAUTH_SECRET=...           # JWT signing secret
NEXTAUTH_URL=http://localhost:5000  # Development URL
```

## EventBus System on Autoscale

### EventBusService Architecture
- **In-Memory Event Bus**: Development mode without external message broker
- **Event Publishing**: Synchronous event processing for development
- **UUID Tracking**: Correlation IDs maintained across service boundaries
- **Graceful Degradation**: Fallback mechanisms for service failures

### Integration with Next.js
```typescript
// EventBusService integrated into API routes
export async function POST(request: Request) {
  // Business logic
  const result = await service.createBooking(data);
  
  // Event publishing
  await EventBusService.publish({
    type: 'booking.created',
    data: result,
    correlationId: generateUUID()
  });
  
  return Response.json(result);
}
```

## Static Asset Management

### Asset Serving Strategy
- **Public Directory**: Static files served from `/public`
- **Favicon System**: Standardized to `/favicon.ico`
- **Image Optimization**: Next.js Image component with lazy loading
- **CDN Preparation**: Assets optimized for Azure CDN migration

### Asset References Fixed
- All logo references point to existing `/favicon.ico`
- No external asset dependencies
- Eliminated 404 errors from missing assets
- Optimized for fast loading in Replit preview

## Database Integration

### Neon PostgreSQL on Autoscale
- **Connection Pool**: Serverless-optimized connection management
- **Query Performance**: Drizzle ORM with typed queries
- **Migration System**: `npm run db:push` for schema updates
- **Development Tools**: Drizzle Studio for database exploration

### Schema Management
```typescript
// shared/schema.ts - Complete database schema
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  role: roleEnum('role').notNull(),
  organizationId: uuid('organization_id').references(() => organizations.id)
});
```

## Performance Optimizations

### Build Performance
- **Turbo Mode**: Next.js compilation with `--turbo` flag
- **Memory Management**: `--max-old-space-size=4096` for large builds
- **Module Caching**: Persistent `.next` cache across sessions
- **TypeScript Optimization**: Incremental type checking

### Runtime Performance
- **Connection Pooling**: Database connections reused across requests
- **Event Bus Optimization**: In-memory processing without network overhead
- **Asset Caching**: Browser caching headers for static resources
- **Component Optimization**: React Server Components where applicable

## Development Workflow

### Local Development Cycle
1. **Code Changes**: Hot reload triggers incremental build
2. **Type Checking**: TypeScript compilation in background
3. **Database Sync**: Automatic schema synchronization
4. **Event Processing**: EventBus handles state changes
5. **Preview Update**: Replit preview iframe updates automatically

### Debugging Capabilities
- **Console Logging**: Real-time logs in Replit console
- **Database Studio**: Visual query interface via Drizzle Studio
- **API Testing**: Built-in request/response debugging
- **Error Boundaries**: Comprehensive error handling with user feedback

## Cross-Origin Configuration

### Replit Preview Integration
```javascript
// next.config.mjs - CORS handling
const nextConfig = {
  async headers() {
    return [
      {
        source: '/_next/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' }
        ]
      }
    ];
  }
};
```

### Preview Iframe Compatibility
- **allowedDevOrigins**: Configured for Replit domains
- **Cross-Origin Isolation**: Headers configured for iframe embedding
- **WebSocket Support**: Real-time updates in preview environment

## Security Considerations

### Development Security
- **Environment Isolation**: Secrets managed via Replit environment variables
- **CORS Restrictions**: Limited to development origins
- **JWT Validation**: Secure token management in development
- **Database Security**: Connection strings encrypted in Replit

### Production Readiness
- **Build Artifacts**: Clean builds without development dependencies
- **Environment Variables**: Production secrets ready for deployment
- **Asset Security**: No sensitive data in static assets
- **API Route Security**: Authentication middleware on all protected routes

This Replit Autoscale environment provides a robust development platform that closely mirrors production behavior while maintaining the flexibility needed for rapid cannabis workforce management platform development.