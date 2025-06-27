# ⚠️ DEPRECATED - INCORRECT AZURE ARCHITECTURE

## This Document Contains OUTDATED Information

**Correct Documentation:** See `/AZURE_DEPLOYMENT_FINAL_ARCHITECTURE.md`

### What Changed:
- ❌ **Wrong:** Separate Azure Functions app with 108 manual functions
- ✅ **Correct:** Azure automatically converts 143 Next.js API routes to Functions
- ❌ **Wrong:** Complex manual deployment process
- ✅ **Correct:** Single Next.js app deployment with `api_location: ""`

This file described an incorrect architecture that was never implemented.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Azure Static Web Apps Configuration](#azure-static-web-apps-configuration)
3. [Azure Functions Implementation](#azure-functions-implementation)
4. [Database Integration (Neon PostgreSQL)](#database-integration)
5. [Content Delivery Network (CDN)](#content-delivery-network)
6. [Azure Front Door Configuration](#azure-front-door-configuration)
7. [Security and Authentication](#security-and-authentication)
8. [Routing and Load Balancing](#routing-and-load-balancing)
9. [Monitoring and Health Checks](#monitoring-and-health-checks)
10. [Deployment Pipeline](#deployment-pipeline)
11. [Environment Configuration](#environment-configuration)
12. [Performance Optimization](#performance-optimization)
13. [Disaster Recovery](#disaster-recovery)
14. [Cost Analysis](#cost-analysis)

## Architecture Overview

### High-Level Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Azure CDN     │    │  Azure Front Door │    │   Azure DNS     │
│   Global Edge   │◄───┤   Load Balancer   │◄───┤   Management    │
│   Caching       │    │   SSL/WAF         │    │                 │
└─────────┬───────┘    └──────────┬───────┘    └─────────────────┘
          │                       │
          ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                Azure Static Web Apps                            │
│  ┌─────────────────┐              ┌─────────────────────────────┐│
│  │   Static Assets │              │      Azure Functions        ││
│  │   Next.js Build │              │      (108 Endpoints)        ││
│  │   - Components  │              │  ┌─────────────────────────┐ ││
│  │   - Pages       │              │  │ Cannabis Booking Mgmt   │ ││
│  │   - Styles      │              │  │ User Management         │ ││
│  │   - Images      │              │  │ Location Services       │ ││
│  └─────────────────┘              │  │ Organization Hierarchy  │ ││
│                                   │  │ Shift Scheduling        │ ││
│                                   │  │ Availability Tracking   │ ││
│                                   │  │ Task Management         │ ││
│                                   │  │ Event Publishing        │ ││
│                                   │  │ Health Monitoring       │ ││
│                                   │  └─────────────────────────┘ ││
│                                   └─────────────────────────────┘│
└─────────────────┬───────────────────────────┬───────────────────┘
                  │                           │
                  ▼                           ▼
        ┌─────────────────┐         ┌─────────────────┐
        │  Neon Database  │         │  External APIs  │
        │  PostgreSQL     │         │  - Google Maps  │
        │  - User Data    │         │  - SendGrid     │
        │  - Bookings     │         │  - Stripe       │
        │  - Organizations│         │                 │
        └─────────────────┘         └─────────────────┘
```

### Technology Stack

- **Frontend**: Next.js 15.3.4 with React 19 RC
- **Backend**: Azure Functions (Node.js 18.x runtime)
- **Database**: Neon PostgreSQL (Serverless)
- **CDN**: Azure CDN with global edge locations
- **Load Balancer**: Azure Front Door Premium
- **Authentication**: NextAuth.js with JWT tokens
- **State Management**: Event-driven microservices architecture
- **Monitoring**: Azure Application Insights
- **Security**: Azure Web Application Firewall (WAF)

## Azure Static Web Apps Configuration

### Core Configuration

```json
{
  "routes": [
    {
      "route": "/api/health",
      "allowedRoles": ["anonymous"]
    },
    {
      "route": "/api/*",
      "allowedRoles": ["authenticated"]
    },
    {
      "route": "/admin/*",
      "allowedRoles": ["internal_admin", "super_admin"]
    },
    {
      "route": "/dashboard/*",
      "allowedRoles": ["authenticated"]
    },
    {
      "route": "/*",
      "rewrite": "/index.html"
    }
  ],
  "responseOverrides": {
    "401": {
      "redirect": "/auth/login",
      "statusCode": 302
    },
    "403": {
      "rewrite": "/unauthorized"
    },
    "404": {
      "rewrite": "/404.html"
    }
  },
  "globalHeaders": {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' https://maps.googleapis.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.neon.tech https://maps.googleapis.com;"
  },
  "platform": {
    "apiRuntime": "node:18"
  },
  "trailingSlash": "Never",
  "networking": {
    "allowedIpRanges": []
  }
}
```

### Build Configuration

```javascript
// next.config.azure-production.mjs
export default {
  output: 'standalone',
  trailingSlash: false,
  images: {
    unoptimized: true
  },
  experimental: {
    outputFileTracingRoot: undefined,
    webpackBuildWorker: false
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Bundle optimization for Azure Functions 244KB limit
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        maxSize: 200000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            maxSize: 150000
          }
        }
      }
    };
    
    return config;
  },
  headers: async () => [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: '*' },
        { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
        { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' }
      ]
    }
  ]
};
```

## Azure Functions Implementation

### Function Architecture

The application deploys 108 Azure Functions covering complete API functionality:

#### Core Service Functions
- **Authentication Services** (8 functions)
  - `/api/auth_login.js` - User authentication with JWT
  - `/api/auth_logout.js` - Session termination
  - `/api/auth_register.js` - User registration
  - `/api/auth_permissions.js` - Role-based permissions
  - `/api/auth_me.js` - Current user session
  - `/api/auth_switch_organization.js` - Multi-tenant switching
  - `/api/auth_service.js` - Authentication microservice
  - `/api/auth_nextauth.js` - NextAuth.js integration

#### Cannabis Business Functions
- **Booking Management** (5 functions)
  - `/api/bookings.js` - Cannabis event bookings CRUD
  - `/api/bookings_id.js` - Individual booking operations
  - `/api/bookings_form_data.js` - Form data validation
  - `/api/bookings_stats.js` - Booking analytics
  - `/api/events.js` - Event publishing system

- **Organization Management** (9 functions)
  - `/api/organizations.js` - Multi-tier organization hierarchy
  - `/api/organizations_id.js` - Organization details
  - `/api/organizations_users.js` - User management
  - `/api/organizations_settings.js` - Configuration management
  - `/api/organizations_branding.js` - White-label customization
  - `/api/organizations_invitations.js` - User invitations
  - `/api/organizations_context.js` - Context switching
  - `/api/organizations_preferences.js` - User preferences
  - `/api/organizations_user.js` - User-organization relationships

#### Workforce Management Functions
- **Staff Management** (12 functions)
  - `/api/users.js` - User CRUD operations
  - `/api/users_id.js` - Individual user management
  - `/api/users_bulk_create.js` - Bulk user creation
  - `/api/team_id.js` - Team member profiles
  - `/api/availability.js` - Staff availability tracking
  - `/api/availability_id.js` - Individual availability
  - `/api/availability_team.js` - Team availability
  - `/api/shifts.js` - Shift scheduling
  - `/api/shifts_id.js` - Individual shift management
  - `/api/shifts_assignments.js` - Staff assignments
  - `/api/shifts_lifecycle.js` - Shift state management
  - `/api/roster_brand_agents.js` - Brand agent roster

#### Location and Geography Functions
- **Location Services** (13 functions)
  - `/api/locations.js` - Cannabis location management
  - `/api/locations_id.js` - Location details
  - `/api/locations_geocode.js` - Address geocoding
  - `/api/locations_approved.js` - Approved locations
  - `/api/locations_pending.js` - Pending approvals
  - `/api/locations_filter.js` - Location filtering
  - `/api/locations_validate.js` - Address validation
  - `/api/locations_states.js` - State management
  - `/api/locations_cities.js` - City listings
  - `/api/locations_regions.js` - Regional groupings
  - `/api/locations_zipcodes.js` - Postal code services
  - `/api/maps_geocode.js` - Google Maps geocoding
  - `/api/maps_places.js` - Places API integration

#### Inventory and Equipment Functions
- **Kit Management** (8 functions)
  - `/api/kits.js` - Equipment kit templates
  - `/api/kits_id.js` - Kit details
  - `/api/kits_activity_kits.js` - Activity-specific kits
  - `/api/kits_activity_kits_id.js` - Activity kit details
  - `/api/kits_instances.js` - Kit instances
  - `/api/kits_instances_id.js` - Instance management
  - `/api/kits_instances_id_approve.js` - Kit approvals
  - `/api/kits_inventory.js` - Inventory tracking

#### Administrative Functions
- **Admin Operations** (15 functions)
  - `/api/admin_users.js` - User administration
  - `/api/admin_organizations.js` - Organization admin
  - `/api/admin_locations.js` - Location administration
  - `/api/admin_locations_id.js` - Location admin details
  - `/api/admin_locations_pending.js` - Pending locations
  - `/api/admin_locations_bulk_update.js` - Bulk operations
  - `/api/admin_rbac_defaults.js` - Default permissions
  - `/api/rbac_permissions.js` - Permission management
  - `/api/rbac_organization_permissions.js` - Org permissions
  - `/api/activities.js` - Activity management
  - `/api/activities_id.js` - Activity details
  - `/api/activity_types.js` - Activity type definitions
  - `/api/tasks.js` - Task management
  - `/api/expenses.js` - Expense tracking
  - `/api/audit.js` - Audit logging

### Function Runtime Configuration

Each Azure Function includes:

```javascript
module.exports = async function (context, req) {
  try {
    const method = req.method;
    const eventBus = new EventBusService();
    const errorHandler = new ProductionErrorHandler();

    // Method handling with full CRUD operations
    switch (method) {
      case 'GET': /* Read operations */
      case 'POST': /* Create operations */  
      case 'PUT': /* Update operations */
      case 'DELETE': /* Delete operations */
    }

    // Event publishing for microservices
    await eventBus.publish('operation.completed', {
      eventId: uuidv4(),
      timestamp: new Date().toISOString(),
      data: result
    });

  } catch (error) {
    // Production error handling
    const errorResponse = errorHandler.handleError(error, req);
    context.res = errorResponse;
  }
};
```

## Database Integration (Neon PostgreSQL)

### Database Architecture

```sql
-- Core Tables for Cannabis Workforce Management

-- Organizations (Multi-tenant)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type organization_type NOT NULL,
  tier service_tier NOT NULL,
  state VARCHAR(2),
  license_number VARCHAR(100),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users with Role-Based Access Control
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role user_role NOT NULL,
  is_active BOOLEAN DEFAULT true,
  cannabis_experience cannabis_experience_level,
  certifications TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cannabis Bookings (Core Business Entity)
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  client_organization_id UUID REFERENCES organizations(id),
  cannabis_booking_type cannabis_booking_type NOT NULL,
  location_id UUID REFERENCES locations(id),
  start_date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status booking_status DEFAULT 'pending',
  stage booking_stage DEFAULT 'planning',
  budget DECIMAL(10,2),
  cannabis_products TEXT[],
  target_audience cannabis_audience_type,
  estimated_attendees INTEGER,
  consumption_allowed BOOLEAN DEFAULT false,
  age_verification_required BOOLEAN DEFAULT true,
  state VARCHAR(2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Locations with Cannabis-Specific Data
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100),
  state VARCHAR(2),
  zip_code VARCHAR(10),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location_type location_type,
  cannabis_license_required BOOLEAN DEFAULT false,
  consumption_area BOOLEAN DEFAULT false,
  security_level security_level DEFAULT 'standard',
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staff Shifts and Scheduling
CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  user_id UUID REFERENCES users(id),
  role cannabis_role NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status shift_status DEFAULT 'scheduled',
  hourly_rate DECIMAL(8,2),
  cannabis_products_handled TEXT[],
  security_clearance_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Equipment Kits for Cannabis Operations
CREATE TABLE kit_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  kit_type kit_type NOT NULL,
  category kit_category,
  cannabis_specific BOOLEAN DEFAULT false,
  secure_storage_required BOOLEAN DEFAULT false,
  state_compliance VARCHAR(2),
  total_value DECIMAL(10,2),
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Connection Configuration

```javascript
// Database connection with Neon PostgreSQL
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export async function queryDatabase(query, params = []) {
  try {
    const result = await sql(query, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Connection pooling configuration
export const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20, // Maximum pool connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};
```

### Environment Variables

```bash
# Neon Database Configuration
DATABASE_URL=postgresql://username:password@host.neon.tech/dbname?sslmode=require

# Authentication
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-domain.azurestaticapps.net
JWT_SECRET=your-jwt-secret

# External API Keys
GOOGLE_MAPS_API_KEY=your-google-maps-key
SENDGRID_API_KEY=your-sendgrid-key
STRIPE_SECRET_KEY=your-stripe-secret

# Azure Configuration
AZURE_CLIENT_ID=your-azure-client-id
AZURE_CLIENT_SECRET=your-azure-client-secret
AZURE_TENANT_ID=your-azure-tenant-id
```

## Content Delivery Network (CDN)

### Azure CDN Configuration

```json
{
  "cdn": {
    "profile": "cannabis-workforce-cdn",
    "sku": "Standard_Microsoft",
    "endpoints": [
      {
        "name": "cannabis-workforce-assets",
        "origin": "polite-mud-027da750f.2.azurestaticapps.net",
        "caching": {
          "rules": [
            {
              "name": "static-assets",
              "conditions": [
                {
                  "operator": "Contains",
                  "parameter": "/_next/static/"
                }
              ],
              "actions": [
                {
                  "name": "CacheExpiration",
                  "value": "365d"
                }
              ]
            },
            {
              "name": "api-no-cache",
              "conditions": [
                {
                  "operator": "BeginsWith",
                  "parameter": "/api/"
                }
              ],
              "actions": [
                {
                  "name": "CacheExpiration",
                  "value": "0s"
                }
              ]
            }
          ]
        },
        "compression": {
          "enabled": true,
          "types": [
            "text/html",
            "text/css",
            "application/javascript",
            "application/json",
            "image/svg+xml"
          ]
        }
      }
    ]
  }
}
```

### Global Edge Locations

Azure CDN provides global distribution across:
- **North America**: 25+ edge locations
- **Europe**: 20+ edge locations  
- **Asia Pacific**: 15+ edge locations
- **South America**: 5+ edge locations
- **Africa**: 3+ edge locations

### Cache Optimization Strategy

```javascript
// Cache headers for different content types
const cacheHeaders = {
  staticAssets: {
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Expires': new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString()
  },
  dynamicContent: {
    'Cache-Control': 'public, max-age=300, s-maxage=300',
    'Vary': 'Accept-Encoding, Authorization'
  },
  apiResponses: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
};
```

## Azure Front Door Configuration

### Load Balancing Setup

```json
{
  "frontdoor": {
    "name": "cannabis-workforce-frontdoor",
    "tier": "Premium",
    "backends": [
      {
        "name": "primary-static-web-app",
        "address": "polite-mud-027da750f.2.azurestaticapps.net",
        "weight": 100,
        "priority": 1,
        "enabled": true
      }
    ],
    "healthProbes": [
      {
        "name": "health-probe",
        "path": "/api/health",
        "protocol": "HTTPS",
        "intervalInSeconds": 30,
        "timeoutInSeconds": 10
      }
    ],
    "routingRules": [
      {
        "name": "api-routing",
        "frontendEndpoints": ["cannabis-workforce.azurefd.net"],
        "acceptedProtocols": ["HTTPS"],
        "patternsToMatch": ["/api/*"],
        "forwardingProtocol": "HTTPS",
        "backendPool": "primary-backend-pool"
      },
      {
        "name": "spa-routing",
        "frontendEndpoints": ["cannabis-workforce.azurefd.net"],
        "acceptedProtocols": ["HTTPS"],
        "patternsToMatch": ["/*"],
        "forwardingProtocol": "HTTPS",
        "backendPool": "primary-backend-pool",
        "customForwardingPath": "/"
      }
    ],
    "waf": {
      "enabled": true,
      "mode": "Prevention",
      "ruleSetType": "OWASP",
      "ruleSetVersion": "3.2",
      "customRules": [
        {
          "name": "rate-limiting",
          "priority": 100,
          "ruleType": "RateLimitRule",
          "rateLimitThreshold": 100,
          "rateLimitDurationInMinutes": 1,
          "action": "Block"
        }
      ]
    }
  }
}
```

### SSL/TLS Configuration

```json
{
  "ssl": {
    "minimumTlsVersion": "1.2",
    "certificateSource": "AzureKeyVault",
    "customDomains": [
      {
        "hostName": "cannabis-workforce.com",
        "certificateType": "Managed",
        "httpsRedirect": true,
        "dnsProvider": "AzureDNS"
      }
    ],
    "hstsSettings": {
      "enabled": true,
      "maxAge": 31536000,
      "includeSubDomains": true,
      "preload": true
    },
    "azureDNS": {
      "enabled": true,
      "zoneManagement": "Automatic",
      "recordTypes": ["A", "AAAA", "CNAME", "TXT"],
      "ttl": 300
    }
  }
}
```

## Security and Authentication

### Web Application Firewall (WAF)

```json
{
  "wafPolicy": {
    "name": "cannabis-workforce-waf",
    "tier": "Premium",
    "rules": {
      "managedRules": [
        {
          "ruleSetType": "Microsoft_DefaultRuleSet",
          "ruleSetVersion": "2.1",
          "action": "Block"
        },
        {
          "ruleSetType": "Microsoft_BotManagerRuleSet", 
          "ruleSetVersion": "1.0",
          "action": "Block"
        }
      ],
      "customRules": [
        {
          "name": "cannabis-legal-states",
          "priority": 100,
          "ruleType": "MatchRule",
          "conditions": [
            {
              "matchVariable": "RemoteAddr",
              "operator": "GeoMatch",
              "matchValues": ["CA", "NY", "CO", "WA", "NV", "OR", "AZ", "MA", "MI", "IL"]
            }
          ],
          "action": "Allow"
        },
        {
          "name": "block-non-cannabis-states",
          "priority": 200,
          "ruleType": "MatchRule",
          "conditions": [
            {
              "matchVariable": "RequestUri",
              "operator": "Contains",
              "matchValues": ["/cannabis", "/dispensary", "/cultivation"]
            }
          ],
          "action": "Block"
        }
      ]
    }
  }
}
```

### Authentication Flow

```javascript
// NextAuth.js configuration for Azure AD integration
export const authOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_CLIENT_ID,
      clientSecret: process.env.AZURE_CLIENT_SECRET,
      tenantId: process.env.AZURE_TENANT_ID,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Custom cannabis industry authentication logic
        const user = await authenticateUser(credentials);
        if (user && user.cannabisLicenseValid) {
          return {
            id: user.id,
            email: user.email,
            role: user.role,
            organizationId: user.organizationId,
            cannabisPermissions: user.cannabisPermissions
          };
        }
        return null;
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.organizationId = user.organizationId;
        token.cannabisPermissions = user.cannabisPermissions;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      session.user.organizationId = token.organizationId;
      session.user.cannabisPermissions = token.cannabisPermissions;
      return session;
    }
  }
};
```

## Routing and Load Balancing

### URL Routing Strategy

```javascript
// staticwebapp.config.json routing configuration
{
  "routes": [
    // Health check (anonymous access)
    {
      "route": "/api/health",
      "allowedRoles": ["anonymous"]
    },
    
    // Cannabis-specific API routes (authenticated)
    {
      "route": "/api/bookings/*",
      "allowedRoles": ["brand_agent", "field_manager", "client_user", "internal_admin"]
    },
    {
      "route": "/api/organizations/*", 
      "allowedRoles": ["authenticated"]
    },
    {
      "route": "/api/locations/*",
      "allowedRoles": ["authenticated"]
    },
    {
      "route": "/api/shifts/*",
      "allowedRoles": ["field_manager", "internal_admin"]
    },
    {
      "route": "/api/kits/*",
      "allowedRoles": ["field_manager", "internal_admin"]
    },
    
    // Admin-only routes
    {
      "route": "/api/admin/*",
      "allowedRoles": ["internal_admin", "super_admin"]
    },
    {
      "route": "/admin/*",
      "allowedRoles": ["internal_admin", "super_admin"]
    },
    
    // Role-based dashboard access
    {
      "route": "/dashboard/brand-agent/*",
      "allowedRoles": ["brand_agent"]
    },
    {
      "route": "/dashboard/field-manager/*", 
      "allowedRoles": ["field_manager", "internal_admin"]
    },
    {
      "route": "/dashboard/client/*",
      "allowedRoles": ["client_user", "client_manager"]
    },
    
    // SPA fallback
    {
      "route": "/*",
      "rewrite": "/index.html"
    }
  ],
  
  // Custom error pages
  "responseOverrides": {
    "401": {
      "redirect": "/auth/login?returnUrl={url}",
      "statusCode": 302
    },
    "403": {
      "rewrite": "/unauthorized",
      "statusCode": 403
    },
    "404": {
      "rewrite": "/404.html",
      "statusCode": 404
    }
  }
}
```

### Load Balancing Configuration

```json
{
  "loadBalancing": {
    "method": "weighted_round_robin",
    "healthCheck": {
      "enabled": true,
      "path": "/api/health",
      "interval": 30,
      "timeout": 10,
      "unhealthyThreshold": 3,
      "healthyThreshold": 2
    },
    "backends": [
      {
        "name": "primary-region",
        "weight": 80,
        "region": "East US 2"
      },
      {
        "name": "secondary-region", 
        "weight": 20,
        "region": "West US 2"
      }
    ],
    "sessionAffinity": {
      "enabled": true,
      "cookieName": "cannabis-workforce-affinity",
      "ttl": 3600
    }
  }
}
```

## Monitoring and Health Checks

### Application Insights Configuration

```javascript
// Application Insights telemetry
import { ApplicationInsights } from '@azure/applicationinsights-web';

const appInsights = new ApplicationInsights({
  config: {
    connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
    enableAutoRouteTracking: true,
    enableCorsCorrelation: true,
    enableRequestHeaderTracking: true,
    enableResponseHeaderTracking: true,
    correlationHeaderExcludedDomains: [
      '*.cannabis-workforce.com'
    ]
  }
});

// Custom cannabis business metrics
export function trackCannabisBooking(booking) {
  appInsights.trackEvent({
    name: 'CannabisBookingCreated',
    properties: {
      bookingId: booking.id,
      cannabisType: booking.cannabisBookingType,
      state: booking.state,
      clientTier: booking.clientTier,
      estimatedRevenue: booking.budget
    },
    measurements: {
      bookingValue: booking.budget,
      staffCount: booking.totalStaffNeeded,
      duration: booking.durationHours
    }
  });
}

export function trackStaffAssignment(assignment) {
  appInsights.trackEvent({
    name: 'StaffAssigned',
    properties: {
      assignmentId: assignment.id,
      staffRole: assignment.role,
      cannabisExperience: assignment.experienceLevel,
      state: assignment.state
    }
  });
}
```

### Health Monitoring Dashboard

```javascript
// Comprehensive health check endpoint
export default async function healthHandler(req, res) {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    environment: process.env.NODE_ENV,
    checks: {
      database: await checkDatabaseHealth(),
      eventBus: await checkEventBusHealth(),
      externalAPIs: await checkExternalAPIHealth(),
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    }
  };

  // Cannabis-specific health checks
  healthStatus.checks.cannabisServices = {
    bookingService: await checkBookingServiceHealth(),
    locationService: await checkLocationServiceHealth(),
    kitService: await checkKitServiceHealth(),
    staffService: await checkStaffServiceHealth()
  };

  const isHealthy = Object.values(healthStatus.checks)
    .every(check => check.status === 'healthy');

  res.status(isHealthy ? 200 : 503).json(healthStatus);
}

async function checkDatabaseHealth() {
  try {
    const result = await sql`SELECT 1 as health_check`;
    return {
      status: 'healthy',
      latency: Date.now() - start,
      connectionPool: {
        active: db.pool.totalCount,
        idle: db.pool.idleCount
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
}
```

## Deployment Pipeline

### GitHub Actions Workflow

```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches: [ main ]

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true
          
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18.x'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Run cannabis compliance checks
        run: npm run lint:cannabis-compliance
        
      - name: Build application
        run: npm run build
        env:
          NODE_ENV: production
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
          JWT_SECRET: ${{ secrets.JWT_SECRET }}
          GOOGLE_MAPS_API_KEY: ${{ secrets.GOOGLE_MAPS_API_KEY }}
          
      - name: Deploy to Azure Static Web Apps
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          api_location: "api"
          output_location: ".next"
          
  close_pull_request_job:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    name: Close Pull Request Job
    steps:
      - name: Close Pull Request
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          action: "close"
```

### DNS Configuration

```json
{
  "azureDNS": {
    "zoneName": "cannabis-workforce.com",
    "resourceGroup": "cannabis-workforce-rg",
    "records": [
      {
        "name": "@",
        "type": "A",
        "ttl": 300,
        "value": "20.50.4.147"
      },
      {
        "name": "www",
        "type": "CNAME", 
        "ttl": 300,
        "value": "cannabis-workforce.azurestaticapps.net"
      },
      {
        "name": "_acme-challenge",
        "type": "TXT",
        "ttl": 300,
        "value": "azure-ssl-verification-token"
      }
    ],
    "autoRegistration": {
      "enabled": true,
      "wildcard": false,
      "subdomainDelegation": true
    }
  }
}
```

### Environment Management

```bash
# Production Environment Variables
AZURE_STATIC_WEB_APPS_API_TOKEN=your-deployment-token
DATABASE_URL=postgresql://user:pass@host.neon.tech/db?sslmode=require
NEXTAUTH_SECRET=your-nextauth-production-secret
NEXTAUTH_URL=https://cannabis-workforce.azurestaticapps.net
JWT_SECRET=your-jwt-production-secret

# External Service API Keys
GOOGLE_MAPS_API_KEY=your-google-maps-production-key
SENDGRID_API_KEY=your-sendgrid-production-key
STRIPE_SECRET_KEY=your-stripe-production-key

# Azure Services
AZURE_CLIENT_ID=your-azure-client-id
AZURE_CLIENT_SECRET=your-azure-client-secret
AZURE_TENANT_ID=your-azure-tenant-id
AZURE_DNS_ZONE=cannabis-workforce.com
AZURE_DNS_RESOURCE_GROUP=cannabis-workforce-rg
APPLICATIONINSIGHTS_CONNECTION_STRING=your-app-insights-connection

# Cannabis Industry Configuration
CANNABIS_LEGAL_STATES=CA,NY,CO,WA,NV,OR,AZ,MA,MI,IL,CT,VT,ME,VA,NM,MT,AK
DEFAULT_CANNABIS_COMPLIANCE_STATE=CA
CANNABIS_AGE_VERIFICATION_REQUIRED=true
CANNABIS_SECURE_STORAGE_REQUIRED=true
```

## Performance Optimization

### Bundle Optimization

```javascript
// Webpack configuration for Azure Functions
const optimizationConfig = {
  splitChunks: {
    chunks: 'all',
    maxSize: 200000, // 200KB limit for Azure Functions
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        chunks: 'all',
        maxSize: 150000
      },
      cannabis: {
        test: /[\\/]cannabis-services[\\/]/,
        name: 'cannabis-core',
        chunks: 'all',
        priority: 10
      }
    }
  },
  usedExports: true,
  sideEffects: false
};

// Code splitting for cannabis-specific modules
const CannabisBookingLazy = lazy(() => import('./cannabis/BookingManagement'));
const CannabisKitsLazy = lazy(() => import('./cannabis/KitManagement'));
const CannabisLocationsLazy = lazy(() => import('./cannabis/LocationServices'));
```

### Database Performance

```sql
-- Performance optimized indexes for cannabis operations
CREATE INDEX CONCURRENTLY idx_bookings_cannabis_state_date 
ON bookings (state, start_date_time) 
WHERE cannabis_booking_type IS NOT NULL;

CREATE INDEX CONCURRENTLY idx_locations_cannabis_licensed 
ON locations (state, cannabis_license_required) 
WHERE cannabis_license_required = true;

CREATE INDEX CONCURRENTLY idx_shifts_cannabis_role_date
ON shifts (role, start_time)
WHERE role IN ('budtender', 'security', 'manager', 'trimmer');

CREATE INDEX CONCURRENTLY idx_users_cannabis_experience
ON users (cannabis_experience, state)
WHERE cannabis_experience IS NOT NULL;

-- Partitioning for large tables
CREATE TABLE bookings_2025 PARTITION OF bookings
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

CREATE TABLE shifts_2025 PARTITION OF shifts  
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
```

### CDN Cache Strategy

```javascript
// Optimized caching for cannabis content
const cacheStrategy = {
  // Static assets - 1 year
  staticAssets: {
    pattern: /\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$/,
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Expires': new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString()
    }
  },
  
  // Cannabis legal state data - 1 hour  
  stateData: {
    pattern: /\/api\/states/,
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  },
  
  // User-specific data - no cache
  userData: {
    pattern: /\/api\/(auth|users|organizations)/,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  },
  
  // Cannabis bookings - 5 minutes
  bookingData: {
    pattern: /\/api\/bookings/,
    headers: {
      'Cache-Control': 'public, max-age=300, s-maxage=300'
    }
  }
};
```

## Disaster Recovery

### Backup Strategy

```json
{
  "backup": {
    "database": {
      "provider": "Neon",
      "frequency": "hourly",
      "retention": "30 days",
      "encryption": "AES-256",
      "crossRegion": true,
      "regions": ["East US 2", "West US 2"]
    },
    "staticAssets": {
      "provider": "Azure Blob Storage", 
      "frequency": "daily",
      "retention": "90 days",
      "replication": "GRS"
    },
    "configuration": {
      "provider": "Azure Key Vault",
      "frequency": "on-change",
      "versioning": true
    }
  }
}
```

### Failover Configuration

```javascript
// Multi-region failover setup
const failoverConfig = {
  primary: {
    region: 'East US 2',
    endpoint: 'https://cannabis-workforce-primary.azurestaticapps.net'
  },
  secondary: {
    region: 'West US 2', 
    endpoint: 'https://cannabis-workforce-secondary.azurestaticapps.net'
  },
  healthCheck: {
    interval: 30000, // 30 seconds
    timeout: 10000,  // 10 seconds
    failureThreshold: 3
  },
  automaticFailover: true,
  trafficSplitting: {
    primary: 90,
    secondary: 10
  }
};
```

## Cost Analysis

### Estimated Monthly Costs (Production)

```json
{
  "costBreakdown": {
    "azureStaticWebApps": {
      "tier": "Standard", 
      "monthlyCost": "$9.00",
      "includes": [
        "100GB bandwidth",
        "Unlimited functions",
        "Custom domains",
        "Authentication"
      ]
    },
    "azureFunctions": {
      "estimatedExecutions": 1000000,
      "monthlyCost": "$40.00",
      "includes": [
        "108 functions",
        "1M executions",
        "400,000 GB-s"
      ]
    },
    "neonDatabase": {
      "tier": "Pro",
      "monthlyCost": "$69.00", 
      "includes": [
        "8GB storage",
        "Unlimited compute",
        "30-day retention",
        "Cross-region backups"
      ]
    },
    "azureCDN": {
      "tier": "Standard",
      "monthlyCost": "$25.00",
      "includes": [
        "Global edge locations",
        "1TB data transfer",
        "Custom domains"
      ]
    },
    "azureFrontDoor": {
      "tier": "Premium",
      "monthlyCost": "$320.00",
      "includes": [
        "WAF protection",
        "Load balancing", 
        "SSL termination",
        "Advanced routing"
      ]
    },
    "applicationInsights": {
      "dataIngestion": "5GB", 
      "monthlyCost": "$15.00"
    },
    "azureDNS": {
      "hostedZone": "1 zone",
      "queries": "1M queries",
      "monthlyCost": "$0.50"
    },
    "externalAPIs": {
      "googleMaps": "$50.00",
      "sendGrid": "$20.00",
      "stripe": "$30.00"
    }
  },
  "totalMonthlyCost": "$578.50",
  "costPerUser": "$5.79", // Based on 100 active users  
  "costPerBooking": "$19.28" // Based on 30 bookings/month
}
```

### Cost Optimization Strategies

```javascript
// Automated scaling based on usage
const scalingConfig = {
  functions: {
    minInstances: 1,
    maxInstances: 20,
    scaleOutCooldown: '5m',
    scaleInCooldown: '10m',
    triggers: [
      {
        type: 'cpu',
        threshold: 70
      },
      {
        type: 'memory', 
        threshold: 80
      },
      {
        type: 'queueLength',
        threshold: 100
      }
    ]
  },
  cdn: {
    compressionEnabled: true,
    webpConversion: true,
    intelligentCaching: true
  },
  database: {
    connectionPooling: true,
    readReplicas: 2,
    autoScaling: true
  }
};
```

## Deployment Checklist

### Pre-Deployment Verification

- [ ] **Environment Configuration**
  - [ ] All environment variables configured in Azure portal
  - [ ] Azure DNS zone configured and validated
  - [ ] Database connection string validated
  - [ ] External API keys tested
  - [ ] Cannabis legal state compliance verified

- [ ] **Security Verification**
  - [ ] WAF rules configured and tested
  - [ ] SSL certificates installed
  - [ ] Authentication flows tested
  - [ ] Role-based access control verified

- [ ] **Performance Testing**
  - [ ] Load testing completed (1000+ concurrent users)
  - [ ] Function cold start times optimized
  - [ ] CDN cache hit ratios validated
  - [ ] Database query performance verified

- [ ] **Cannabis Compliance**
  - [ ] Age verification workflows tested
  - [ ] State-specific content filtering verified
  - [ ] Secure storage requirements validated
  - [ ] Audit logging implemented

### Post-Deployment Monitoring

- [ ] **Health Checks**
  - [ ] All 108 Azure Functions responding
  - [ ] Database connectivity confirmed
  - [ ] External API integrations working
  - [ ] CDN distribution active globally

- [ ] **Business Metrics**
  - [ ] Cannabis booking creation working
  - [ ] Staff assignment workflows functional
  - [ ] Location services operational
  - [ ] Kit management system active

## Conclusion

This comprehensive deployment architecture provides enterprise-grade infrastructure for the Cannabis Workforce Management Platform on Azure. The solution delivers:

- **Scalability**: Auto-scaling Azure Functions handling thousands of concurrent requests
- **Global Performance**: Azure CDN with worldwide edge locations
- **Security**: Enterprise WAF protection and state-specific compliance
- **Reliability**: Multi-region failover and 99.9% uptime SLA
- **Cannabis Industry Focus**: Specialized features for cannabis legal states and operations

The deployment supports the complete Rishi Platform ecosystem with 108 Azure Functions, comprehensive database integration, and optimized performance for cannabis industry requirements.

**Total Architecture Cost**: $578.50/month for production deployment
**Estimated Users Supported**: 100+ concurrent users
**Cannabis Bookings Capacity**: 1000+ monthly bookings
**Global Availability**: 99.9% uptime across all regions