#!/bin/bash
echo "Checking TypeScript types..."
npx tsc --noEmit --skipLibCheck
exit_code=$?

if [ $exit_code -eq 0 ]; then
  echo "✅ TypeScript check passed with no errors!"
  exit 0
else
  echo "❌ TypeScript check failed with errors."
  exit 1
fi
