# Azure Deployment Fix - Build Script Error

## ACTUAL PROBLEM IDENTIFIED
**Root Cause**: Missing build scripts in package.json causing Oryx build failure
**Azure Error**: "Could not find either 'build' or 'build:azure' node under 'scripts'"
**Previous Analysis**: Incorrectly assumed upload timeout issue

## SOLUTION IMPLEMENTED
- Added missing 'build:azure' script to package.json
- Restored proper output_location: 'out' for Next.js static export
- Fixed workflow configuration for Azure Static Web Apps

## Root Cause Hypothesis (Prioritized)

### 1. Azure Static Web Apps Upload Service Issue (Most Likely)
- Upload polling timeout suggests Azure backend processing failure
- Consistent 590s timeout across all configurations indicates service limit
- Build succeeds but upload/deployment pipeline fails

### 2. Azure Account/Region Limitations
- Subscription resource limits or quotas
- Regional service availability issues
- Account billing/permission restrictions

### 3. Repository/Token Issues (Least Likely)
- AZURE_STATIC_WEB_APPS_API_TOKEN insufficient permissions
- GitHub repository size/history causing conflicts

## Systematic Testing Plan (3 Tests Max)

### Test 1: Service Health Verification (5 minutes)
**Goal**: Verify if Azure Static Web Apps service is functional
**Action**: Check Azure Portal service health and try manual deployment
**Expected**: Identifies if this is a service-wide issue

### Test 2: Fresh Environment Test (10 minutes)
**Goal**: Eliminate account/token/repository variables
**Action**: Create new Azure Static Web App resource with different region
**Expected**: Isolates account vs service issues

### Test 3: Alternative Deployment Path (10 minutes)
**Goal**: Bypass GitHub Actions if service is functional
**Action**: Direct Azure Portal deployment from GitHub repository
**Expected**: Confirms if issue is in GitHub Actions integration vs core service

## Decision Matrix
- **All Tests Fail**: Azure service issue - escalate to Azure Support
- **Manual Works**: GitHub Actions integration issue - fix workflow
- **Different Region Works**: Regional service limitation - change region
- **New Resource Works**: Original resource corrupted - use new resource

## Success Criteria
Single successful deployment with accessible Rishi Platform at Azure URL

## Time Limit
30 minutes maximum - if unresolved, recommend alternative deployment strategy