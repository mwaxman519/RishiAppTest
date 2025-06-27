#!/bin/bash
# Git Repository Cleanup Commands to Reduce 24GB Storage Usage
# Run these commands manually if you have Git expertise

echo "=== Git Repository Cleanup Script ==="
echo "Current storage usage: 25GB (24GB in .git directory)"
echo ""

echo "1. Remove large files from Git history:"
echo "git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch *.tar.gz *.png attached_assets/* azure-clean/* tmp/* debug/* phase3-app-files/*' --prune-empty --tag-name-filter cat -- --all"
echo ""

echo "2. Force garbage collection:"
echo "git gc --prune=now --aggressive"
echo ""

echo "3. Remove backup refs created by filter-branch:"
echo "rm -rf .git/refs/original/"
echo ""

echo "4. Force push to update remote (if applicable):"
echo "git push origin --force --all"
echo ""

echo "Expected result: Reduce storage from 25GB to under 2GB"
echo ""
echo "Alternative: Create fresh repository and copy only essential files"