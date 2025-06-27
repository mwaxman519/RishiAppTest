#!/bin/bash

echo "=== Git Repository Cleanup ==="
echo "Reducing 24GB storage usage..."

# Step 1: Remove large files from Git history
echo "Step 1: Removing large files from Git history..."
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch \
   *.tar.gz *.png *.jpg *.jpeg *.gif *.ico *.pdf \
   attached_assets/* azure-clean/* tmp/* debug/* phase3-app-files/* \
   workforce-management-complete.tar.gz azure-deployment-complete.tar.gz \
   generated-icon.png build.log full-build.log *.backup' \
  --prune-empty --tag-name-filter cat -- --all

echo "Step 2: Cleaning up Git references..."
rm -rf .git/refs/original/

echo "Step 3: Aggressive garbage collection..."
git gc --prune=now --aggressive

echo "Step 4: Checking new repository size..."
echo "Before cleanup: 24GB"
echo "After cleanup:"
du -sh .git

echo "=== Cleanup Complete ==="
echo "Your storage should now be under 2GB"