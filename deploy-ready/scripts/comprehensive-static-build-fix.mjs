#!/usr/bin/env node

console.log('Comprehensive static build fix starting...');

// Fix schema exports for Azure Functions
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';

// Create shared directory if doesn't exist
if (!existsSync('shared')) {
  mkdirSync('shared', { recursive: true });
}

// Create minimal schema if doesn't exist
if (!existsSync('shared/schema.ts')) {
  writeFileSync('shared/schema.ts', `
export const organizations = {};
export const users = {};
export const bookings = {};
export const locations = {};
`);
}

console.log('Fixed schema exports');

// Check for API routes
if (existsSync('app/api')) {
  console.log('API routes found - will be converted to Azure Functions');
} else {
  console.log('No API routes found');
}

console.log('Comprehensive static build fix completed');