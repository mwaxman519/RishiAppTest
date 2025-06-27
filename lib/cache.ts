/**
 * Simple in-memory cache implementation
 * This is used for caching frequently accessed data to reduce database load
 */
// Basic cache configuration
const cacheConfig = {
  enabled: process.env.NODE_ENV !== 'development',
  ttl: 300, // 5 minutes in seconds
};

interface CacheItem<T> {
  value: T;
  expiresAt: number;
}

/**
 * In-memory cache for storing frequently accessed data
 * This is optimized for serverless environments where function instances are ephemeral
 */
class Cache {
  private cache: Map<string, CacheItem<any>> = new Map();
  private readonly enabled: boolean;
  private readonly defaultTtl: number; // Time to live in milliseconds

  constructor() {
    this.enabled = cacheConfig.enabled;
    this.defaultTtl = cacheConfig.ttl * 1000; // Convert seconds to milliseconds
  }

  /**
   * Get a value from the cache
   * @param key The cache key
   * @returns The cached value or undefined if not found
   */
  get<T>(key: string): T | undefined {
    if (!this.enabled) return undefined;

    const item = this.cache.get(key);
    if (!item) return undefined;

    // Check if the item has expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return item.value as T;
  }

  /**
   * Set a value in the cache
   * @param key The cache key
   * @param value The value to cache
   * @param ttl Optional time to live in seconds (overrides default)
   */
  set<T>(key: string, value: T, ttl?: number): void {
    if (!this.enabled) return;

    const ttlMs = (ttl !== undefined ? ttl : cacheConfig.ttl) * 1000;
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  /**
   * Delete a value from the cache
   * @param key The cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all items from the cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get or set a value in the cache
   * If the value is not in the cache, the factory function is called to create it
   * @param key The cache key
   * @param factory A function that returns the value to cache
   * @param ttl Optional time to live in seconds (overrides default)
   * @returns The cached or newly created value
   */
  async getOrSet<T>(key: string, factory: () => Promise<T>, ttl?: number): Promise<T> {
    // If caching is disabled, just call the factory and return the result
    if (!this.enabled) {
      return await factory();
    }

    const cachedValue = this.get<T>(key);
    if (cachedValue !== undefined) {
      return cachedValue;
    }

    const value = await factory();
    this.set(key, value, ttl);
    return value;
  }
}

// Create a singleton instance of the cache
export const cache = new Cache();