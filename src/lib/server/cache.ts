// src/lib/server/cache.ts
import NodeCache from 'node-cache';

// Initialize cache with basic settings
export const cache = new NodeCache({
  stdTTL: 3600, // Default 1 hour TTL
  checkperiod: 600, // Check for expired keys every 10 minutes
  useClones: false // Better performance, but be careful with object mutations
});

// Cache configuration constants
export const CACHE_KEYS = {
  HOMEPAGE_RANDOM: 'homepage_random',
  MANGA_METADATA: 'manga_meta',
  SEARCH_RESULTS: 'search',
  BROWSE_CATEGORIES: 'browse_categories',
  STATIC_DATA: 'static_data'
} as const;

export const CACHE_TTL = {
  HOMEPAGE_RANDOM: 60 * 60, // 1 hour - random posts change hourly
  MANGA_METADATA: 60 * 60 * 24, // 24 hours - manga metadata rarely changes
  SEARCH_RESULTS: 60 * 30, // 30 minutes - search results
  BROWSE_CATEGORIES: 60 * 60 * 12, // 12 hours - category listings
  STATIC_DATA: 60 * 60 * 24 * 7 // 1 week - truly static data
} as const;

// Generic cache helper functions
export function getCached<T>(key: string): T | undefined {
  try {
    return cache.get<T>(key);
  } catch (error) {
    console.error('Cache get error:', error);
    return undefined;
  }
}

export function setCached<T>(key: string, data: T, ttl?: number): void {
  try {
    cache.set(key, data, ttl);
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

export function deleteCached(key: string): void {
  try {
    cache.del(key);
  } catch (error) {
    console.error('Cache delete error:', error);
  }
}

// Homepage-specific cache functions
export class HomepageCache {
  static getRandomManga(page: number, seed: number): any | null {
    const key = `${CACHE_KEYS.HOMEPAGE_RANDOM}_p${page}_s${seed}`;
    return getCached(key);
  }

  static setRandomManga(page: number, seed: number, data: any): void {
    const key = `${CACHE_KEYS.HOMEPAGE_RANDOM}_p${page}_s${seed}`;
    setCached(key, data, CACHE_TTL.HOMEPAGE_RANDOM);
  }

  static getTotalCount(): number | null {
    return getCached('manga_total_count');
  }

  static setTotalCount(count: number): void {
    setCached('manga_total_count', count, CACHE_TTL.STATIC_DATA);
  }

  // Force refresh homepage cache (for manual refresh)
  static clearAll(): void {
    const keys = cache.keys();
    keys.forEach(key => {
      if (key.startsWith(CACHE_KEYS.HOMEPAGE_RANDOM)) {
        deleteCached(key);
      }
    });
  }
}

// Utility function for async cache operations
export async function withCache<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Try cache first
  const cached = getCached<T>(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  // Cache miss - fetch fresh data
  const fresh = await fetcher();
  setCached(cacheKey, fresh, ttl);
  return fresh;
}

// HTTP cache headers helper
export function getCacheHeaders(ttlSeconds: number, isPublic = true) {
  return {
    'Cache-Control': `${isPublic ? 'public' : 'private'}, max-age=${ttlSeconds}, s-maxage=${ttlSeconds}`,
    'Expires': new Date(Date.now() + ttlSeconds * 1000).toUTCString(),
    'Vary': 'Accept-Encoding'
  };
}

// Cache stats for monitoring
export function getCacheStats() {
  return {
    keys: cache.keys().length,
    stats: cache.getStats(),
    memory: process.memoryUsage()
  };
}