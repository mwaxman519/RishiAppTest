#!/usr/bin/env node

console.log('Running pre-deployment validation...');

const fs = require('fs');
const path = require('path');

// Check required files
const requiredFiles = [
  'package.json',
  'next.config.mjs',
  'app/layout.tsx',
  'app/page.tsx'
];

let allGood = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✓ ${file} exists`);
  } else {
    console.log(`✗ ${file} missing`);
    allGood = false;
  }
});

// Check API functions
if (fs.existsSync('api')) {
  const apiFunctions = fs.readdirSync('api');
  console.log(`✓ Found ${apiFunctions.length} API functions`);
} else {
  console.log('ℹ No API functions found');
}

if (allGood) {
  console.log('Pre-deployment validation passed');
} else {
  console.log('Pre-deployment validation failed');
  process.exit(1);
}