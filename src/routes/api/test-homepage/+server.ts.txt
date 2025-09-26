// src/routes/api/test-homepage/+server.ts
// Test route to verify Turso homepage functionality
import { json } from '@sveltejs/kit';
import { TursoHomepage, generateHourlySeed } from '$lib/server/turso-helpers';
import { getCacheStats, HomepageCache } from '$lib/server/cache';

export async function GET({ url }) {
  const test = url.searchParams.get('test') || 'connection';
  
  try {
    switch (test) {
      case 'connection':
        const isConnected = await TursoHomepage.testConnection();
        return json({
          success: isConnected,
          message: isConnected ? 'Turso connection successful' : 'Turso connection failed',
          timestamp: new Date().toISOString()
        });

      case 'count':
        const totalCount = await TursoHomepage.getTotalCount();
        return json({
          success: true,
          totalManga: totalCount,
          cached: HomepageCache.getTotalCount() !== null,
          timestamp: new Date().toISOString()
        });

      case 'random':
        const seed = generateHourlySeed();
        const comics = await TursoHomepage.getRandomManga(1, 5, seed);
        return json({
          success: true,
          seed,
          comicsCount: comics.length,
          comics: comics.map(c => ({
            id: c.id,
            title: c.title,
            hasSlug: !!c.slug,
            hasImage: !!c.featureImage
          })),
          timestamp: new Date().toISOString()
        });

      case 'cache':
        const stats = getCacheStats();
        return json({
          success: true,
          cacheStats: stats,
          timestamp: new Date().toISOString()
        });

      case 'full':
        // Full homepage test
        const fullSeed = generateHourlySeed();
        const [fullCount, fullComics] = await Promise.all([
          TursoHomepage.getTotalCount(),
          TursoHomepage.getRandomManga(1, 10, fullSeed)
        ]);

        return json({
          success: true,
          data: {
            total: fullCount,
            comics: fullComics.length,
            seed: fullSeed,
            sampleTitles: fullComics.slice(0, 3).map(c => c.title),
            allHaveSlugs: fullComics.every(c => !!c.slug)
          },
          cacheStats: getCacheStats(),
          timestamp: new Date().toISOString()
        });

      default:
        return json({
          success: false,
          message: 'Unknown test type. Use: connection, count, random, cache, or full'
        });
    }
  } catch (error) {
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST({ request }) {
  const { action } = await request.json();
  
  try {
    switch (action) {
      case 'clearCache':
        HomepageCache.clearAll();
        return json({
          success: true,
          message: 'Homepage cache cleared'
        });

      default:
        return json({
          success: false,
          message: 'Unknown action'
        });
    }
  } catch (error) {
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}