# Quick Conflict Resolution Commands

Run these commands to resolve the git conflicts and deploy the database fix:

```bash
# Remove git lock
rm -f .git/index.lock

# Accept current version for documentation conflicts
git checkout --ours AZURE_DEPLOYMENT_SUCCESS_STATUS.md
git checkout --ours AZURE_DEPLOYMENT_FINAL_STATUS.md

# Add resolved files
git add AZURE_DEPLOYMENT_SUCCESS_STATUS.md
git add AZURE_DEPLOYMENT_FINAL_STATUS.md
git add .github/workflows/azure-static-web-apps-icy-grass-0ebe51e10.yml

# Complete the merge
git commit -m "Resolve merge conflicts and deploy database fix"

# Push the database fix
git push origin main
```

This will deploy the critical database fix that converts from Prisma to Drizzle ORM, resolving the Azure build failure.