# GitHub API Push Commands

Since git push is timing out, here are the exact commands to push the Azure deployment fix using the GitHub API:

## Current Status
- Local commit `a2ffa1c` contains the multi-platform detection fix
- GitHub repository is at older commit `ab6b7ed`
- Need to push the fix to trigger Azure build

## GitHub API Push Commands

```bash
# Get the current commit details
curl -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/mwaxman519/RishiAppTest/commits/a2ffa1c4e1176650e07af1034de8611833d5781a

# Create a new tree with the updated files
curl -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/mwaxman519/RishiAppTest/git/trees \
  -d '{
    "base_tree": "ab6b7edb1a22f3996eece08ad1c9dca6aaa765b3",
    "tree": [
      {
        "path": "oryx.ini",
        "mode": "100644",
        "type": "blob",
        "content": "[build]\nplatform = nodejs\nversion = 18.20.4\n\n[platforms]\ndisable-python = true\ndisable-php = true\ndisable-dotnet = true\ndisable-java = true"
      }
    ]
  }'

# Create the commit
curl -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/mwaxman519/RishiAppTest/git/commits \
  -d '{
    "message": "Fix Azure multi-platform detection: eliminate Python/PHP files + enhanced oryx.ini",
    "tree": "NEW_TREE_SHA",
    "parents": ["ab6b7edb1a22f3996eece08ad1c9dca6aaa765b3"]
  }'

# Update the main branch reference
curl -X PATCH \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/mwaxman519/RishiAppTest/git/refs/heads/main \
  -d '{
    "sha": "NEW_COMMIT_SHA"
  }'
```

## Simplified Alternative: Manual Upload

1. Go to https://github.com/mwaxman519/RishiAppTest
2. Create new file: `oryx.ini`
3. Content:
```
[build]
platform = nodejs
version = 18.20.4

[platforms]
disable-python = true
disable-php = true
disable-dotnet = true
disable-java = true
```
4. Commit message: "Fix Azure multi-platform detection"
5. This will trigger the Azure build automatically

The key fix is adding `oryx.ini` to force Node.js-only detection and prevent the multi-platform error.