/* eslint-disable prettier/prettier */
import type { PageServerLoad } from './$types';
import { supabase } from '$lib/supabaseClient';
import { HomepageCache, getCacheHeaders } from '$lib/server/cache';

// Define types for better TypeScript support
interface MangaItem {
	id: number;
	title: string;
	feature_image_url: string;
}

interface SlugItem {
	slug: string;
	manga_id: number;
}

interface ComicItem {
	id: number;
	title: string;
	slug: string;
	featureImage: string;
	author: { name: string };
}

export const load: PageServerLoad = async ({ url, setHeaders }) => {
	const PAGE_SIZE = 20;

	const pageParam = parseInt(url.searchParams.get('page') ?? '1', 10);
	const page = Math.max(1, isNaN(pageParam) ? 1 : pageParam);
	const forceRefresh = url.searchParams.get('refresh') === 'true';

	// Generate time-based cache key that changes every 30 minutes for better randomness
	const now = new Date();
	const cacheSlot = Math.floor(now.getTime() / (30 * 60 * 1000)); // 30-minute slots
	const timeBasedSeed = cacheSlot % 1000000; // Keep seed reasonable

	// Check cache first (unless force refresh)
	if (!forceRefresh) {
		const cached = HomepageCache.getRandomManga(page, timeBasedSeed);
		if (cached) {
			// Set cache headers for CDN/browser caching
			setHeaders(getCacheHeaders(60 * 10)); // 10 minutes browser cache
			return cached;
		}
	}

	const from = (page - 1) * PAGE_SIZE;

	// Get total count (cache for longer since it changes less frequently)
	let totalCount = HomepageCache.getTotalCount();
	if (!totalCount) {
		const { count, error: countError } = await supabase
			.from('manga')
			.select('*', { count: 'exact', head: true });

		if (countError) {
			console.error('Error getting manga count:', countError);
			throw new Error('Failed to load manga count');
		}
		
		totalCount = count ?? 0;
		HomepageCache.setTotalCount(totalCount);
	}

	// Use time-based seeded random for better randomness that still allows pagination
	const { data: manga, error: mangaError } = await supabase
		.rpc('get_random_manga', {
			seed_value: timeBasedSeed / 1000000, // PostgreSQL setseed expects value between 0 and 1
			limit_count: PAGE_SIZE,
			offset_count: from
		});

	// Fallback if RPC doesn't exist - use simple random (less consistent across pages)
	let fallbackManga: MangaItem[] = [];
	if (mangaError || !manga) {
		console.log('RPC not available, falling back to simple random');
		
		// Get more items and shuffle them for better randomness
		const fetchSize = Math.min(PAGE_SIZE * 3, 100); // Get extra items to choose from
		const randomOffset = Math.floor(Math.random() * Math.max(0, totalCount - fetchSize));
		
		const { data: fallback, error: fallbackError } = await supabase
			.from('manga')
			.select('id, title, feature_image_url')
			.range(randomOffset, randomOffset + fetchSize - 1);

		if (fallbackError || !fallback) {
			console.error('Error fetching manga:', fallbackError);
			throw new Error('Failed to load manga');
		}

		// Shuffle and take the required page size
		fallbackManga = fallback
			.map(item => ({ ...item, _sortKey: Math.random() }))
			.sort((a, b) => a._sortKey - b._sortKey)
			.slice(from % fetchSize, (from % fetchSize) + PAGE_SIZE)
			.map(({ _sortKey, ...item }) => item);
	}

	const finalManga: MangaItem[] = manga || fallbackManga;

	// Get slugs for the manga
	const mangaIds = finalManga.map((m: MangaItem) => m.id);
	const { data: slugs, error: slugError } = await supabase
		.from('slug_map')
		.select('slug, manga_id')
		.in('manga_id', mangaIds);

	if (slugError || !slugs) {
		console.error('Error fetching slugs:', slugError);
		throw new Error('Failed to load slugs');
	}

	// Combine manga with slugs
	const comics: ComicItem[] = finalManga.map((item: MangaItem) => ({
		id: item.id,
		title: item.title,
		slug: (slugs as SlugItem[]).find((s) => s.manga_id === item.id)?.slug ?? '',
		featureImage: item.feature_image_url,
		author: { name: 'Unknown' }
	}));

	const totalPages = Math.ceil(totalCount / PAGE_SIZE);
	const isFirstPage = page === 1;

	const result = {
		comics,
		total: totalCount,
		page,
		cacheSlot: timeBasedSeed, // For debugging/monitoring
		meta: {
			title: isFirstPage
				? 'Read Hentai Pics | Read Hentai, Doujinshi, and Latest Pictures'
				: `Popular Hentai | Page ${page} | Read Hentai `,
			description: isFirstPage
				? 'Discover popular manga, hentai, and doujinshi that others are reading on Read Hentai. Find trending adult comics and community favorites!'
				: `Browse page ${page} of popular hentai selections. Discover trending adult comics, hentai and doujinshi. Read Hentai Alternative | Rule 34 Alternative`,
			prev: page > 1 ? `/?page=${page - 1}` : null,
			next: page < totalPages ? `/?page=${page + 1}` : null
		}
	} as const;

	// Cache the result for 30 minutes
	HomepageCache.setRandomManga(page, timeBasedSeed, result);
	
	// Set cache headers for CDN/browser caching  
	setHeaders(getCacheHeaders(60 * 10)); // 10 minutes browser cache

	return result;
};