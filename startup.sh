#!/bin/bash

# Run the script to set up documentation symlinks
echo "Setting up documentation symlinks..."
node scripts/sync-docs.js

# Start the application
echo "Starting application..."
npm run dev