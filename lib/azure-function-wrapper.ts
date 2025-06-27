/**
 * Azure Functions wrapper that integrates event processing with API routes
 * Replaces the incompatible in-memory event bus with database-based events
 */

import { NextRequest, NextResponse } from 'next/server';
import { createEventBus, AzureEventBus } from '../events/azure-event-bus';

export interface AzureFunctionContext {
  functionName: string;
  eventBus: AzureEventBus;
  startTime: number;
}

/**
 * Wrapper function for Azure Functions compatibility
 * Handles event processing and provides consistent context
 */
export function withAzureFunction(
  functionName: string,
  handler: (request: NextRequest, context: AzureFunctionContext) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now();
    const eventBus = createEventBus(functionName);
    
    try {
      // Process any pending events for this function
      await eventBus.processPendingEvents();
      
      // Create function context
      const context: AzureFunctionContext = {
        functionName,
        eventBus,
        startTime
      };
      
      // Execute the main handler
      const result = await handler(request, context);
      
      // Log function execution metrics
      const duration = Date.now() - startTime;
      console.log(`Function ${functionName} completed in ${duration}ms`);
      
      return result;
      
    } catch (error) {
      console.error(`Function ${functionName} error:`, error);
      
      // Return structured error response
      return NextResponse.json(
        { 
          error: 'Internal server error',
          timestamp: new Date().toISOString(),
          functionName,
          requestId: crypto.randomUUID()
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Simplified wrapper for functions that don't need event processing
 */
export function withSimpleAzureFunction(
  functionName: string,
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return withAzureFunction(functionName, async (request, context) => {
    return await handler(request);
  });
}