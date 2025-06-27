#!/bin/bash
echo "Checking Azure deployment status for Rishi Platform..."

# Check latest deployment run
echo "Fetching latest deployment status..."
RESPONSE=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/mwaxman519/rishi-platform/actions/runs" | head -2000)

echo "Latest runs for calm-bush workflow:"
echo "$RESPONSE" | grep -A 10 "calm-bush-02f79a90f" | grep -E "status|conclusion|run_number"

echo ""
echo "Checking Azure Static Web App URL..."
curl -s -I https://calm-bush-02f79a90f.2.azurestaticapps.net/ | head -5