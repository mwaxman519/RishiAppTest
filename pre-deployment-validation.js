#!/usr/bin/env node
console.log('Running pre-deployment validation...');
const fs = require('fs');

const requiredFiles = ['package.json', 'next.config.mjs', 'app/layout.tsx', 'app/page.tsx'];
let allGood = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✓ ${file} exists`);
  } else {
    console.log(`✗ ${file} missing`);
    allGood = false;
  }
});

if (fs.existsSync('api')) {
  const apiFunctions = fs.readdirSync('api');
  console.log(`✓ Found ${apiFunctions.length} API functions`);
}

console.log(allGood ? 'Pre-deployment validation passed' : 'Pre-deployment validation failed');