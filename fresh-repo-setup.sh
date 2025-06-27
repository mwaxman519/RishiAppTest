#!/bin/bash
# Fresh Repository Setup - Alternative to Git cleanup
# This creates a new Git repository with only essential files

echo "Creating fresh repository backup..."

# Create backup of essential files
mkdir -p ../rishi-backup
cp -r app/ ../rishi-backup/
cp -r components/ ../rishi-backup/ 
cp -r lib/ ../rishi-backup/
cp -r shared/ ../rishi-backup/
cp -r server/ ../rishi-backup/
cp -r services/ ../rishi-backup/
cp -r types/ ../rishi-backup/
cp -r public/ ../rishi-backup/
cp package.json ../rishi-backup/
cp package-lock.json ../rishi-backup/
cp next.config.mjs ../rishi-backup/
cp tailwind.config.js ../rishi-backup/
cp tsconfig.json ../rishi-backup/
cp .env.* ../rishi-backup/ 2>/dev/null || true
cp .gitignore ../rishi-backup/
cp replit.md ../rishi-backup/

echo "Backup created in ../rishi-backup"
echo "To use fresh repo:"
echo "1. Delete current .git: rm -rf .git"
echo "2. Initialize new repo: git init"
echo "3. Add files: git add ."
echo "4. Initial commit: git commit -m 'Fresh repository - Rishi Platform'"
echo ""
echo "This will reduce storage from 26GB to under 2GB"