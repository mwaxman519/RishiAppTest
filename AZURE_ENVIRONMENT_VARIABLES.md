# Azure Static Web Apps Environment Variables

## Required Environment Variables for Cannabis Workforce Management Platform

Add these environment variables to your Azure Static Web Apps Configuration:

### Database Configuration
```
DATABASE_URL=postgresql://username:password@ep-hostname.us-east-1.postgres.neon.tech/dbname?sslmode=require
```

### NextAuth.js Configuration
```
NEXTAUTH_URL=https://icy-smoke-02dc9440f.6.azurestaticapps.net
NEXTAUTH_SECRET=generated-secret-will-be-provided
```

### Application Configuration
```
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://icy-smoke-02dc9440f.6.azurestaticapps.net
```

### Optional API Keys (if using external services)
```
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
STRIPE_PUBLIC_KEY=pk_live_your-stripe-public-key
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
```

## How to Add Environment Variables to Azure

1. **Navigate to Azure Portal**
   - Go to your Static Web App resource
   - Select "Configuration" from the left menu

2. **Add Application Settings**
   - Click "Add" button
   - Enter Name and Value for each environment variable
   - Click "OK" to save

3. **Required Variables for Basic Functionality**
   - `DATABASE_URL` - Your Neon PostgreSQL connection string
   - `NEXTAUTH_URL` - Your Azure Static Web App URL
   - `NEXTAUTH_SECRET` - Generate a secure random string (32+ chars)

## Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

Or use this online generator:
https://generate-secret.vercel.app/32

## Database Setup

If you need a new Neon database:
1. Go to https://neon.tech
2. Create a new project
3. Copy the connection string
4. Use it as your DATABASE_URL

## Notes

- Environment variables are automatically injected into Azure Functions
- Changes require redeployment to take effect
- Never commit secrets to your repository
- Use the Azure portal to manage production secrets securely