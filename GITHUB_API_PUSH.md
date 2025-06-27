# Direct GitHub Push from Replit

## One-Command Solution

Run this single command in Replit's shell to push the Azure fix directly to your GitHub repository:

```bash
# Set your GitHub token and push the file
export GITHUB_TOKEN="your_github_token_here"

curl -X PUT \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/mwaxman519/rishi-platform/contents/next.config.azure-production.mjs" \
  -d "{
    \"message\": \"Fix Azure deployment: Add missing production configuration\",
    \"content\": \"$(base64 -w 0 azure-fix-files/next.config.azure-production.mjs)\",
    \"branch\": \"main\"
  }"
```

## How to get your GitHub token:

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name like "Replit Deploy"
4. Check "repo" permissions
5. Copy the token

## Complete command with token:

Replace `your_token_here` with your actual GitHub token:

```bash
export GITHUB_TOKEN="ghp_your_actual_token_here"

curl -X PUT \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/mwaxman519/rishi-platform/contents/next.config.azure-production.mjs" \
  -d "{
    \"message\": \"Fix Azure deployment: Add missing production configuration\",
    \"content\": \"$(base64 -w 0 azure-fix-files/next.config.azure-production.mjs)\",
    \"branch\": \"main\"
  }"
```

This command will:
1. Upload the file directly to your GitHub repository
2. Trigger Azure deployment automatically
3. Fix your deployment within 3 minutes