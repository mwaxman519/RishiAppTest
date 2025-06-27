#!/bin/bash

# Exit on any error
set -e

echo "Starting the application in production mode..."

# Use environment port or default to 3000
PORT=${PORT:-3000}
echo "Starting server on port: $PORT"

# Start the Next.js application in production mode
npx next start -p $PORT