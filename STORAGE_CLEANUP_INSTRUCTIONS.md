# Storage Cleanup Instructions

## Current Issue
- **Total storage:** 26GB
- **Git repository:** 24GB (caused by large files in Git history)
- **Node modules:** 1.1GB (normal)
- **Other files:** <1GB

## Root Cause
Large binary files were committed to Git, creating massive pack files:
- 7.1GB pack file
- 5.8GB pack file  
- 5.4GB pack file
- 3.7GB pack file

## Manual Cleanup Commands

Run these commands in your terminal to reduce storage to under 2GB:

### Step 1: Remove large files from Git history
```bash
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch *.tar.gz *.png attached_assets/* azure-clean/* tmp/* debug/* phase3-app-files/*' --prune-empty --tag-name-filter cat -- --all
```

### Step 2: Clean up Git references
```bash
rm -rf .git/refs/original/
```

### Step 3: Aggressive garbage collection
```bash
git gc --prune=now --aggressive
```

### Step 4: Check new size
```bash
du -sh .git
```

## Expected Result
- Storage should drop from 26GB to under 2GB
- Git repository should be ~500MB or less
- All application functionality preserved

## Already Completed
✓ Created comprehensive .gitignore
✓ Removed large directories from working tree
✓ Application remains fully functional

## Alternative: Fresh Repository
If Git cleanup doesn't work, you can:
1. Create new repository
2. Copy only essential files (exclude .git, node_modules, .next)
3. Initialize fresh Git history