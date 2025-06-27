#!/bin/bash

# Exit on any error
set -e

echo "Starting optimized production build process..."

# Increase memory limit for Node.js
export NODE_OPTIONS="--max-old-space-size=4096"

# Install dependencies
npm ci

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Run database push to ensure schema is up to date
echo "Updating database schema..."
node db-push.js

# Build the Next.js application with optimization flags
echo "Building Next.js application with optimizations..."
npx next build

echo "Optimized production build completed successfully!"