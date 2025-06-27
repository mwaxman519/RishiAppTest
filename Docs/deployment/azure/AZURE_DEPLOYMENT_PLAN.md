# Azure Static Web Apps Deployment Plan
## Cannabis Workforce Management Platform

### Iterative Deployment Strategy

**Phase 1: Basic Pipeline Validation**
- Deploy single HTML file (`test-deployment.html`)
- Validate GitHub Actions workflow
- Confirm Azure Static Web Apps basic functionality
- Test CDN distribution and SSL certificate

**Phase 2: Static Next.js Export**
- Configure Next.js for static export (`output: 'export'`)
- Build static assets to `/out` directory
- Deploy frontend without API routes
- Test routing and static asset delivery

**Phase 3: Full Application with Azure Functions**
- Convert Next.js API routes to Azure Functions
- Configure database connection strings
- Set up environment variables
- Deploy complete application

### Azure Configuration

**App location:** `/` (root directory)
**Api location:** `api` (Azure Functions from Next.js API routes)
**Output location:** `out` (Next.js static export output)

### Build Configuration

```json
{
  "buildPresets": "Next.js",
  "buildCommand": "npm run build:azure",
  "outputLocation": "out",
  "apiLocation": "api"
}
```

### Environment Variables (Phase 3)
- `DATABASE_URL` - Neon PostgreSQL connection string
- `NEXTAUTH_SECRET` - Authentication secret
- `NEXTAUTH_URL` - Production domain URL
- `GOOGLE_MAPS_API_KEY` - Google Maps integration

### GitHub Repository Structure
- Repository: `rishiapptest`
- Branch: `main`
- Account: `mwaman519`

### Deployment Validation Steps

1. **Phase 1 Checklist:**
   - [ ] GitHub Actions workflow triggers
   - [ ] Build completes successfully
   - [ ] Static HTML file serves correctly
   - [ ] HTTPS certificate active
   - [ ] Custom domain configuration (if needed)

2. **Phase 2 Checklist:**
   - [ ] Next.js static export builds
   - [ ] All routes accessible
   - [ ] Static assets load correctly
   - [ ] Client-side routing works
   - [ ] Performance optimization active

3. **Phase 3 Checklist:**
   - [ ] API routes convert to Azure Functions
   - [ ] Database connections establish
   - [ ] Authentication flow works
   - [ ] All features functional
   - [ ] Production monitoring active

### Troubleshooting Common Issues

**Build Failures:**
- Check Node.js version compatibility (18.x)
- Verify package.json scripts
- Review webpack configuration

**API Route Issues:**
- Ensure serverless function compatibility
- Check Azure Functions runtime version
- Validate environment variable access

**Performance Optimization:**
- Enable CDN caching
- Optimize bundle sizes
- Configure proper headers

### Success Metrics
- Build time < 5 minutes
- Page load time < 2 seconds
- 99.9% uptime
- Global CDN distribution active