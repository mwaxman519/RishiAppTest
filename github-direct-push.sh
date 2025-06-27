#!/bin/bash

# GitHub Direct Push Script
# This script pushes the Azure fix file directly to your GitHub repository

REPO="mwaxman519/rishi-platform"
BRANCH="main"
FILE_PATH="next.config.azure-production.mjs"

# You need to set your GitHub token as an environment variable
# Get your token from: https://github.com/settings/tokens
if [ -z "$GITHUB_TOKEN" ]; then
    echo "Error: GITHUB_TOKEN environment variable is required"
    echo "Get your token from: https://github.com/settings/tokens"
    echo "Then run: export GITHUB_TOKEN=your_token_here"
    exit 1
fi

# Read the file content
FILE_CONTENT=$(cat azure-fix-files/next.config.azure-production.mjs | base64)

# Create the file via GitHub API
curl -X PUT \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/$REPO/contents/$FILE_PATH" \
  -d "{
    \"message\": \"Fix Azure deployment: Add missing production configuration\",
    \"content\": \"$FILE_CONTENT\",
    \"branch\": \"$BRANCH\"
  }"

echo "File pushed to GitHub repository successfully!"
echo "Azure deployment will restart automatically."