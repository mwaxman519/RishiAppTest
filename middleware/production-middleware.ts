// Production Middleware Stack
import { NextRequest, NextResponse } from 'next/server';
import { RateLimiterService, RateLimitConfigs, createRateLimitHeaders } from '../services/rate-limiter';
import { v4 as uuidv4 } from 'uuid';

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
};

export class ProductionMiddleware {
  private rateLimiter = RateLimiterService.getInstance();

  async handle(request: NextRequest): Promise<NextResponse | null> {
    const response = NextResponse.next();
    const requestId = uuidv4();
    
    response.headers.set('X-Request-ID', requestId);

    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    if (request.method === 'OPTIONS') {
      const corsResponse = new NextResponse(null, { status: 200 });
      Object.entries(CORS_HEADERS).forEach(([key, value]) => {
        corsResponse.headers.set(key, value);
      });
      return corsResponse;
    }

    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    const rateLimitResult = this.applyRateLimit(request);
    if (!rateLimitResult.allowed) {
      return this.createRateLimitResponse(rateLimitResult, requestId);
    }

    const rateLimitHeaders = createRateLimitHeaders(rateLimitResult);
    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  }

  private applyRateLimit(request: NextRequest) {
    const pathname = new URL(request.url).pathname;
    const clientIP = this.getClientIP(request);
    
    let config = RateLimitConfigs.API_GENERAL;
    
    if (pathname.startsWith('/api/bookings')) {
      config = RateLimitConfigs.CANNABIS_BOOKING;
    } else if (pathname.startsWith('/api/auth')) {
      config = RateLimitConfigs.AUTH;
    } else if (pathname.startsWith('/api/health')) {
      config = RateLimitConfigs.HEALTH_CHECK;
    }

    return this.rateLimiter.checkRateLimit(clientIP, config);
  }

  private createRateLimitResponse(rateLimitResult: any, requestId: string): NextResponse {
    const headers = createRateLimitHeaders(rateLimitResult);
    headers['X-Request-ID'] = requestId;
    
    return NextResponse.json({
      error: {
        message: 'Rate limit exceeded',
        code: 'RATE_LIMIT_EXCEEDED',
        requestId,
        timestamp: new Date().toISOString()
      },
      success: false
    }, { status: 429, headers });
  }

  private getClientIP(request: NextRequest): string {
    const xForwardedFor = request.headers.get('x-forwarded-for');
    const xRealIP = request.headers.get('x-real-ip');
    
    if (xForwardedFor) {
      return xForwardedFor.split(',')[0].trim();
    }
    
    if (xRealIP) {
      return xRealIP;
    }
    
    return request.ip || '127.0.0.1';
  }
}

export const productionMiddleware = new ProductionMiddleware();