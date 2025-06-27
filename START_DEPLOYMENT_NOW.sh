#!/bin/bash

# Direct Azure Deployment Trigger Script
# Resolves git push timeout by creating manual deployment package

echo "🚀 Starting Azure Deployment Process..."

# Create deployment directory
mkdir -p /tmp/azure-final-deploy
cd /tmp/azure-final-deploy

# Copy essential deployment files from working directory
cp -r /tmp/azure-deploy/RishiAppTest/* . 2>/dev/null || true

# Ensure critical files exist
if [ ! -f "oryx.ini" ]; then
    echo "Creating oryx.ini..."
    cat > oryx.ini << 'EOF'
[build]
platform = nodejs
version = 18.20.4

[platforms]
disable-python = true
disable-php = true
disable-dotnet = true
disable-java = true
disable-ruby = true
disable-go = true
EOF
fi

# Verify deployment token is in workflow
if ! grep -q "549c1a33c5703c94112228dc191a4d5eb4c1b3e616c9cc7df371b3ad6036eb8601" .github/workflows/azure-static-web-apps-yellow-rock-0a390fd10.yml; then
    echo "❌ Azure deployment token missing from workflow"
    exit 1
fi

# Remove any Python/PHP files
find . -name "*.py" -delete 2>/dev/null || true
find . -name "*.php" -delete 2>/dev/null || true
rm -f pyproject.toml uv.lock requirements.txt composer.json 2>/dev/null || true

# Create deployment package
echo "📦 Creating deployment package..."
tar -czf ../azure-deployment-final.tar.gz \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='out' \
    --exclude='*.log' \
    .

echo "✅ Deployment package ready: /tmp/azure-deployment-final.tar.gz"
echo ""
echo "NEXT STEPS:"
echo "1. Download the package: /tmp/azure-deployment-final.tar.gz"
echo "2. Extract and push to GitHub repository"
echo "3. Azure will automatically build and deploy"
echo ""
echo "Expected Azure URL: https://yellow-rock-0a390fd10.1.azurestaticapps.net"