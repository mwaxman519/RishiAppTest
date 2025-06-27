/**
 * Resilience utilities for handling transient failures and improving system reliability
 * This module provides tools for implementing resilience patterns like retry,
 * circuit breaker, and bulkhead isolation
 */

/**
 * Circuit Breaker states
 */
export enum CircuitState {
  CLOSED = 'CLOSED',    // Normal operation - requests are allowed through
  OPEN = 'OPEN',        // Failure detected - fast fail without executing operation
  HALF_OPEN = 'HALF_OPEN' // Testing for recovery - allows a single request through
}

/**
 * Circuit Breaker configuration
 */
export interface CircuitBreakerConfig {
  failureThreshold: number;   // Number of failures before opening circuit
  resetTimeout: number;       // Time in ms to wait before trying again (OPEN -> HALF_OPEN)
  operationTimeout: number;   // Time in ms to wait before considering operation timed out
  name?: string;              // Optional name for the circuit breaker
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  resetTimeout: 30000, // 30 seconds
  operationTimeout: 10000, // 10 seconds
};

/**
 * CircuitBreaker implementation
 * Prevents cascading failures by stopping execution when a service is failing
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private resetTimer: NodeJS.Timeout | null = null;
  private lastError: Error | null = null;
  public config: CircuitBreakerConfig;

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Execute an operation with circuit breaker protection
   * @param operation Function to execute
   * @returns Result of the operation
   * @throws Error if circuit is open or operation fails
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      throw new Error(`Circuit ${this.config.name || 'unnamed'} is OPEN - operation rejected`);
    }

    // If HALF_OPEN, only allow one request to test service
    const isHalfOpen = this.state === CircuitState.HALF_OPEN;

    try {
      // Set up operation timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Operation timeout after ${this.config.operationTimeout}ms`));
        }, this.config.operationTimeout);
      });

      // Execute operation with timeout
      const result = await Promise.race([operation(), timeoutPromise]);

      // If successful and HALF_OPEN, close the circuit
      if (isHalfOpen) {
        this.closeCircuit();
      }

      return result as T;
    } catch (error) {
      // Record failure
      this.recordFailure(error instanceof Error ? error : new Error(String(error)));

      if (isHalfOpen) {
        // If failed during HALF_OPEN, reopen the circuit
        this.openCircuit();
      } else if (this.failureCount >= this.config.failureThreshold) {
        // Open circuit if failure threshold reached
        this.openCircuit();
      }

      throw error;
    }
  }

  /**
   * Get current circuit state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Get last error that occurred
   */
  getLastError(): Error | null {
    return this.lastError;
  }

  /**
   * Reset circuit breaker to closed state
   */
  reset(): void {
    this.closeCircuit();
  }

  /**
   * Force circuit to open state
   */
  forceOpen(): void {
    this.openCircuit();
  }

  /**
   * Get circuit breaker status information
   */
  getStatus() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastError: this.lastError ? this.lastError.message : null,
      thresholdReached: this.failureCount >= this.config.failureThreshold,
      config: this.config,
    };
  }

  /**
   * Open the circuit
   */
  private openCircuit(): void {
    if (this.state !== CircuitState.OPEN) {
      this.state = CircuitState.OPEN;
      
      // Set timer to try again (move to HALF_OPEN)
      if (this.resetTimer) {
        clearTimeout(this.resetTimer);
      }
      
      this.resetTimer = setTimeout(() => {
        this.state = CircuitState.HALF_OPEN;
      }, this.config.resetTimeout);
    }
  }

  /**
   * Close the circuit
   */
  private closeCircuit(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
      this.resetTimer = null;
    }
  }

  /**
   * Record a failure
   */
  private recordFailure(error: Error): void {
    this.failureCount++;
    this.lastError = error;
  }
}

/**
 * Circuit breaker registry to manage multiple circuit breakers
 */
class CircuitBreakerRegistry {
  private circuits: Map<string, CircuitBreaker> = new Map();

  /**
   * Get or create a circuit breaker
   */
  getOrCreate(name: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
    if (!this.circuits.has(name)) {
      this.circuits.set(name, new CircuitBreaker({
        name,
        ...config
      }));
    }
    return this.circuits.get(name) as CircuitBreaker;
  }

  /**
   * Get a circuit breaker if it exists
   */
  get(name: string): CircuitBreaker | undefined {
    return this.circuits.get(name);
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    this.circuits.forEach(circuit => circuit.reset());
  }

  /**
   * Get status of all circuit breakers
   */
  getAllStatus(): Record<string, ReturnType<CircuitBreaker['getStatus']>> {
    const result: Record<string, ReturnType<CircuitBreaker['getStatus']>> = {};
    this.circuits.forEach((circuit, name) => {
      result[name] = circuit.getStatus();
    });
    return result;
  }
}

// Singleton instance of the registry
export const circuitBreakerRegistry = new CircuitBreakerRegistry();

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  backoffFactor: number;
  maxDelay?: number;
  retryableErrors?: (RegExp | string)[];
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  backoffFactor: 2,
  maxDelay: 30000, // 30 seconds
};

/**
 * Retry executor - attempts an operation multiple times with exponential backoff
 */
export class RetryExecutor {
  private config: RetryConfig;

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = { ...DEFAULT_RETRY_CONFIG, ...config };
  }

  /**
   * Execute operation with retry logic
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error | unknown;
    let delay = this.config.initialDelay;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        // Check if we should retry this error
        if (!this.isRetryable(error) || attempt >= this.config.maxRetries) {
          throw error;
        }

        // Wait before next retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Calculate next delay with exponential backoff
        delay = Math.min(
          delay * this.config.backoffFactor,
          this.config.maxDelay || Number.POSITIVE_INFINITY
        );
      }
    }

    // We should never reach here due to the throw in the catch block,
    // but TypeScript doesn't know that
    throw lastError;
  }

  /**
   * Check if an error is retryable based on configuration
   */
  private isRetryable(error: unknown): boolean {
    // If no specific errors configured, retry all errors
    if (!this.config.retryableErrors || this.config.retryableErrors.length === 0) {
      return true;
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Check if error matches any of the retryable errors
    return this.config.retryableErrors.some(pattern => {
      if (pattern instanceof RegExp) {
        return pattern.test(errorMessage);
      }
      return errorMessage.includes(pattern);
    });
  }
}

export default {
  CircuitBreaker,
  circuitBreakerRegistry,
  RetryExecutor,
  CircuitState
};