# Simple Deployment Steps

## Step 1: Create GitHub Repository
1. Go to https://github.com
2. Click "New repository"
3. Name: `rishi-platform`
4. Make it Public
5. Don't initialize with README
6. Click "Create repository"
7. Copy the repository URL

## Step 2: Extract and Upload Using Git

Run these commands in your Replit terminal:

```bash
# Extract the deployment package
tar -xzf rishi-platform-azure.tar.gz

# Create a new directory for GitHub upload
mkdir github-upload
cd github-upload

# Copy all files
cp ../app . -r
cp ../shared . -r
cp ../types . -r
cp ../public . -r
cp ../api . -r
cp ../next.config.azure.mjs ./next.config.mjs
cp ../package.azure.json ./package.json
cp ../staticwebapp.config.json .
cp ../tailwind.config.js .
cp ../postcss.config.mjs .
cp ../tsconfig.json .
cp ../.env.example .

# Create .gitignore
echo "node_modules/
.next/
out/
.env.local
.env
*.log" > .gitignore

# Create README
echo "# Rishi Platform
Cannabis workforce management system for Azure Static Web Apps" > README.md

# Initialize Git and push
git init
git add .
git commit -m "Initial deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/rishi-platform.git
git push -u origin main
```

## Step 3: Create Azure Static Web App
1. Azure Portal → Create resource → Static Web App
2. Name: rishi-platform
3. Resource Group: rishi-platform-rg
4. Source: GitHub
5. Repository: rishi-platform
6. Branch: main
7. Build preset: Next.js
8. App location: /
9. API location: api
10. Output location: out

Azure will build and deploy automatically in 3-5 minutes.