#!/bin/bash

# Exit on error
set -e

echo "Starting build process..."

# Install dependencies (skip audit to speed up process)
npm ci --no-audit

# Set up environment for build
export NODE_OPTIONS="--max-old-space-size=4096"

# Generate Prisma client directly
echo "Generating Prisma client..."
if ! npx prisma generate --schema=prisma/schema.prisma; then
  echo "Warning: Prisma client generation failed, but continuing with build"
fi

# Build the Next.js application
echo "Building Next.js application..."
npm run build

echo "Build completed successfully!"