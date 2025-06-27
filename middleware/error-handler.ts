// Production Error Handling Middleware
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export interface ErrorContext {
  requestId: string;
  method: string;
  url: string;
  userAgent?: string;
  userId?: string;
  organizationId?: string;
  timestamp: Date;
}

export interface ErrorResponse {
  error: {
    message: string;
    code?: string;
    requestId: string;
    timestamp: string;
  };
  success: false;
}

export class ProductionErrorHandler {
  static createErrorResponse(
    error: Error | string,
    context: ErrorContext,
    statusCode = 500,
    errorCode?: string
  ): NextResponse<ErrorResponse> {
    const errorMessage = error instanceof Error ? error.message : error;
    
    console.error('API Error:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      context,
      statusCode,
      errorCode
    });

    const response: ErrorResponse = {
      error: {
        message: this.sanitizeErrorMessage(errorMessage, statusCode),
        code: errorCode,
        requestId: context.requestId,
        timestamp: context.timestamp.toISOString()
      },
      success: false
    };

    return NextResponse.json(response, { 
      status: statusCode,
      headers: {
        'X-Request-ID': context.requestId,
        'Content-Type': 'application/json'
      }
    });
  }

  private static sanitizeErrorMessage(message: string, statusCode: number): string {
    if (process.env.NODE_ENV === 'production') {
      switch (statusCode) {
        case 400: return 'Bad Request: Invalid input provided';
        case 401: return 'Unauthorized: Authentication required';
        case 403: return 'Forbidden: Insufficient permissions';
        case 404: return 'Not Found: Resource does not exist';
        case 409: return 'Conflict: Resource already exists';
        case 422: return 'Validation Error: Please check your input';
        case 429: return 'Rate Limit Exceeded: Too many requests';
        case 500: return 'Internal Server Error: Something went wrong';
        case 503: return 'Service Unavailable: Please try again later';
        default: return 'An error occurred while processing your request';
      }
    }
    return message;
  }

  static createErrorContext(request: NextRequest, additionalContext?: Partial<ErrorContext>): ErrorContext {
    return {
      requestId: uuidv4(),
      method: request.method,
      url: request.url,
      userAgent: request.headers.get('user-agent') || undefined,
      timestamp: new Date(),
      ...additionalContext
    };
  }

  static handleDatabaseError(error: Error, context: ErrorContext): NextResponse<ErrorResponse> {
    let statusCode = 500;
    let errorCode = 'DATABASE_ERROR';

    if (error.message.includes('duplicate key') || error.message.includes('UNIQUE constraint')) {
      statusCode = 409;
      errorCode = 'DUPLICATE_RESOURCE';
    } else if (error.message.includes('foreign key') || error.message.includes('FOREIGN KEY constraint')) {
      statusCode = 400;
      errorCode = 'INVALID_REFERENCE';
    } else if (error.message.includes('connection') || error.message.includes('timeout')) {
      statusCode = 503;
      errorCode = 'DATABASE_UNAVAILABLE';
    }

    return this.createErrorResponse(error, context, statusCode, errorCode);
  }

  static handleValidationError(error: any, context: ErrorContext): NextResponse<ErrorResponse> {
    let message = 'Validation failed';
    
    if (error.issues && Array.isArray(error.issues)) {
      const issues = error.issues.map((issue: any) => 
        `${issue.path.join('.')}: ${issue.message}`
      ).join(', ');
      message = `Validation failed: ${issues}`;
    } else if (error.message) {
      message = error.message;
    }

    return this.createErrorResponse(message, context, 422, 'VALIDATION_ERROR');
  }
}

export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<NextResponse<R>>
) {
  return async (...args: T): Promise<NextResponse<R | ErrorResponse>> => {
    try {
      return await handler(...args);
    } catch (error) {
      const [request] = args;
      const context = ProductionErrorHandler.createErrorContext(request as NextRequest);
      
      if (error instanceof Error) {
        if (error.name === 'ZodError') {
          return ProductionErrorHandler.handleValidationError(error, context);
        }
        
        if (error.message.includes('database') || error.message.includes('SQL')) {
          return ProductionErrorHandler.handleDatabaseError(error, context);
        }
      }
      
      return ProductionErrorHandler.createErrorResponse(
        error instanceof Error ? error : 'Unknown error occurred',
        context
      );
    }
  };
}