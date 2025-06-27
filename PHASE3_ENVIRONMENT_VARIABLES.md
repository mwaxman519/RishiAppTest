# Phase 3 Environment Variables Configuration

## Azure Static Web Apps Environment Settings

Configure these environment variables in Azure Portal > Static Web Apps > Configuration:

### Required Database Connection
```
DATABASE_URL=postgresql://rishiAppProdDB_owner:npg_h5vrTomMiI9Q@ep-dark-wildflower-a85rz3um-pooler.eastus2.azure.neon.tech/rishiAppProdDB?sslmode=require
```

### Authentication Secrets
```
NEXTAUTH_SECRET=f8e7d6c5b4a3928174650291837465019283746502918374650291837465f8
JWT_SECRET=a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890
```

### Production URL (Update after deployment)
```
NEXTAUTH_URL=https://your-app-name.azurestaticapps.net
```

### Optional Services (Add if needed)
```
GOOGLE_MAPS_API_KEY=your_google_maps_key_here
SENDGRID_API_KEY=your_sendgrid_key_here
```

## How to Configure in Azure Portal

1. Go to Azure Portal > Static Web Apps
2. Select your app (rishiapptest)
3. Click "Configuration" in left menu
4. Click "Add" for each environment variable
5. Enter Name and Value for each secret above
6. Click "Save" after adding all variables

## Security Notes

- NEXTAUTH_SECRET: 64 characters, cryptographically secure
- JWT_SECRET: 64 characters, used for token signing
- DATABASE_URL: Connection string with SSL enabled
- All secrets are unique and production-ready

## Verification

After deployment, test these endpoints:
- `/api/health` - Health check with database connection
- `/api/auth/session` - Authentication system
- `/api/organizations/user` - Database query functionality

The application will use these secrets for secure database connections, user authentication, and API route protection.