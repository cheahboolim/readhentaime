// src/lib/server/turso-helpers.ts
import { db } from './db';
import { HomepageCache } from './cache';

// Types for our database results
interface MangaRow {
  id: string;
  title: string;
  feature_image_url: string | null;
}

interface SlugRow {
  slug: string;
  manga_id: string;
}

interface ComicResult {
  id: string;
  title: string;
  slug: string;
  featureImage: string | null;
  author: { name: string };
}

// Efficient homepage data fetching
export class TursoHomepage {
  
  // Get total manga count (cached)
  static async getTotalCount(): Promise<number> {
    const cached = HomepageCache.getTotalCount();
    if (cached !== null) {
      return cached;
    }

    const result = await db.execute('SELECT COUNT(*) as count FROM manga');
    const count = result.rows[0]?.count as number || 0;
    
    HomepageCache.setTotalCount(count);
    return count;
  }

  // Get random manga for homepage with seed-based ordering
  static async getRandomManga(page: number, pageSize: number, seed: number): Promise<ComicResult[]> {
    const offset = (page - 1) * pageSize;
    
    // Use a deterministic but pseudo-random ordering based on seed
    // This ensures same results for same seed, but different results for different seeds
    const result = await db.execute({
      sql: `
        SELECT 
          m.id,
          m.title,
          m.feature_image_url
        FROM manga m
        ORDER BY (
          -- Create pseudo-random order using seed and manga ID hash
          (CAST(
            CASE 
              WHEN m.id GLOB '[0-9]*' THEN SUBSTR(m.id, 1, 8)
              ELSE 12345678
            END
          AS INTEGER) * ?) % 2147483647
        )
        LIMIT ? OFFSET ?
      `,
      args: [seed, pageSize, offset]
    });

    if (!result.rows || result.rows.length === 0) {
      return [];
    }

    // Get manga IDs to fetch slugs
    const mangaIds = result.rows.map((row: any) => row.id);
    
    // Fetch slugs in batch
    const slugResult = await db.execute({
      sql: `SELECT slug, manga_id FROM slug_map WHERE manga_id IN (${mangaIds.map(() => '?').join(',')})`,
      args: mangaIds
    });

    // Create slug lookup map
    const slugMap = new Map<string, string>();
    (slugResult.rows || []).forEach((row: any) => {
      slugMap.set(row.manga_id, row.slug);
    });

    // Transform to expected format
    const comics: ComicResult[] = result.rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      slug: slugMap.get(row.id) || '',
      featureImage: row.feature_image_url,
      author: { name: 'Unknown' } // We can optimize this later with artist data
    }));

    return comics;
  }

  // Alternative approach: Simple random without seed (fallback)
  static async getRandomMangaSimple(page: number, pageSize: number): Promise<ComicResult[]> {
    const offset = (page - 1) * pageSize;
    
    const result = await db.execute({
      sql: `
        SELECT 
          m.id,
          m.title,
          m.feature_image_url,
          s.slug
        FROM manga m
        LEFT JOIN slug_map s ON m.id = s.manga_id
        ORDER BY RANDOM()
        LIMIT ? OFFSET ?
      `,
      args: [pageSize, offset]
    });

    const comics: ComicResult[] = (result.rows || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      slug: row.slug || '',
      featureImage: row.feature_image_url,
      author: { name: 'Unknown' }
    }));

    return comics;
  }

  // Test database connection
  static async testConnection(): Promise<boolean> {
    try {
      const result = await db.execute('SELECT 1 as test');
      return result.rows.length > 0;
    } catch (error) {
      console.error('Turso connection test failed:', error);
      return false;
    }
  }
}

// Utility function to generate hourly seed (changes every hour)
export function generateHourlySeed(): number {
  return Math.floor(Date.now() / (1000 * 60 * 60));
}

// Utility function to validate page parameters
export function validatePageParams(pageParam: string | null): number {
  const parsed = parseInt(pageParam || '1', 10);
  return Math.max(1, isNaN(parsed) ? 1 : parsed);
}