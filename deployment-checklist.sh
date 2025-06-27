#!/bin/bash

# Exit on any error
set -e

echo "Running pre-deployment checks..."

# Check required environment variables
echo "Checking environment variables..."
required_vars=("DATABASE_URL" "NEXTAUTH_SECRET" "NEXTAUTH_URL")
missing_vars=()

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    missing_vars+=("$var")
  fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
  echo "❌ Missing required environment variables: ${missing_vars[*]}"
  exit 1
else
  echo "✅ All required environment variables are set"
fi

# Check database connectivity
echo "Checking database connectivity..."
if node -e "
const { Pool } = require('@neondatabase/serverless');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT 1').then(() => {
  console.log('✅ Database connection successful');
  process.exit(0);
}).catch(err => {
  console.error('❌ Database connection failed:', err.message);
  process.exit(1);
});
"; then
  echo "Database check passed"
else
  echo "Database check failed, please verify your database configuration"
  exit 1
fi

# Check for Prisma schema
echo "Checking Prisma schema..."
if [ -f "./prisma/schema.prisma" ]; then
  echo "✅ Prisma schema found"
else
  echo "❌ Prisma schema not found"
  exit 1
fi

# Verify build dependencies
echo "Verifying build dependencies..."
if [ -f "package.json" ] && [ -f "next.config.mjs" ]; then
  echo "✅ Build configuration files found"
else
  echo "❌ Missing build configuration files"
  exit 1
fi

echo "✅ Pre-deployment checks completed successfully!"