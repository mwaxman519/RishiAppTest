# Integration Testing Framework Documentation

## Overview
This document outlines the setup and configuration of the integration testing infrastructure for the location services and infrastructure components.

## Current Status
- ✅ Basic Jest test environment working
- ✅ ES modules configuration resolved
- ✅ Simple test running successfully 
- ⏳ Location service integration tests requiring dependency mocking
- ⏳ Event bus and circuit breaker tests requiring careful dependency management

## Configuration Details
- Node environment: `NODE_ENV=test`
- Testing framework: Jest with TypeScript support
- ESM Support: Using `extensionsToTreatAsEsm` for `.ts`, `.tsx`, and `.jsx` files
- Jest config location: `jest.config.mjs`
- Module resolution: Using path aliases `@/` for app directory

## Running Tests
- Run all tests: `./run-tests.sh`
- Run location tests: `./run-location-tests.sh`
- Run a specific test: `./run-specific-tests.sh <test-file-pattern>`
- Run simple validation test: `./run-simple-test.sh`

## Known Issues
1. Module resolution for imports in test files needs careful handling
   - Use relative imports when necessary: `import { Something } from '../../services/path/to/module'`
   - For complex dependencies, manual mocking may be required

2. TypeScript incompatibilities between location models
   - Type inconsistencies between core and enhanced location models need resolution

3. ES modules vs CommonJS compatibility
   - Remains a challenge for certain module imports

## Next Steps
1. Create proper mock implementations for:
   - EventBus
   - Database repositories
   - External service clients

2. Implement comprehensive integration tests for:
   - Location service
   - Event publisher
   - Circuit breaker

3. Address type compatibility issues between location models