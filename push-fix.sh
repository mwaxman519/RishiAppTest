#!/bin/bash

# Script to push the Azure fix file to your existing repository
echo "Adding missing Azure configuration file to your repository..."

# You need to provide your GitHub token
read -p "Enter your GitHub token: " GITHUB_TOKEN

# Push the file using GitHub API
curl -X PUT \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/mwaxman519/rishi-platform/contents/next.config.azure-production.mjs" \
  -d "{
    \"message\": \"Fix Azure deployment: Add missing production configuration\",
    \"content\": \"$(base64 -w 0 azure-fix-files/next.config.azure-production.mjs)\",
    \"branch\": \"main\"
  }"

echo "File pushed successfully! Azure deployment will restart automatically."