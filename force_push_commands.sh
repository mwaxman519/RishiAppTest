#!/bin/bash

# Rishi Platform - Force Push Commands to Resolve Merge Conflicts
# Run these commands in your local terminal or Git environment

echo "=== RISHI PLATFORM FORCE PUSH COMMANDS ==="
echo "These commands will force push all files to resolve merge conflicts"
echo ""

# Step 1: Add all files to git
echo "1. Adding all files to git..."
git add .

# Step 2: Commit all changes
echo "2. Committing all changes..."
git commit -m "Force push: Resolve merge conflicts - Complete Rishi Platform deployment"

# Step 3: Force push to main branch
echo "3. Force pushing to main branch..."
git push --force-with-lease origin main

# Alternative force push (if above fails)
echo "Alternative: If the above fails, use this command:"
echo "git push --force origin main"

echo ""
echo "=== VERIFICATION COMMANDS ==="
echo "After force push, verify with:"
echo "git status"
echo "git log --oneline -5"

echo ""
echo "=== AZURE DEPLOYMENT TRIGGER ==="
echo "The force push will automatically trigger Azure Static Web Apps deployment"
echo "Monitor deployment at: https://github.com/[your-repo]/actions"