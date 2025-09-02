/* eslint-disable prettier/prettier */
import type { PageServerLoad } from './$types';
import { supabase } from '$lib/supabaseClient';

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

export const load: PageServerLoad = async ({ url }) => {
	const PAGE_SIZE = 20;

	const pageParam = parseInt(url.searchParams.get('page') ?? '1', 10);
	const page = Math.max(1, isNaN(pageParam) ? 1 : pageParam);
	const refreshParam = url.searchParams.get('refresh');
	const seedParam = url.searchParams.get('seed');

	// Generate a seed for consistent pagination within the same random set
	// If refresh=true or no seed, generate new seed
	let seed: number;
	if (refreshParam === 'true' || !seedParam) {
		seed = Math.floor(Math.random() * 1000000);
	} else {
		seed = parseInt(seedParam, 10) || Math.floor(Math.random() * 1000000);
	}

	const from = (page - 1) * PAGE_SIZE;
	const to = from + PAGE_SIZE - 1;

	// First, get the total count for pagination
	const { count: totalCount, error: countError } = await supabase
		.from('manga')
		.select('*', { count: 'exact', head: true });

	if (countError) {
		console.error('Error getting manga count:', countError);
		throw new Error('Failed to load manga count');
	}

	// Use seeded random with PostgreSQL
	const { data: manga, error: mangaError } = await supabase
		.rpc('get_random_manga', {
			seed_value: seed / 1000000, // PostgreSQL setseed expects value between 0 and 1
			limit_count: PAGE_SIZE,
			offset_count: from
		});

	// Fallback if RPC doesn't exist - use simple random (less consistent across pages)
	let fallbackManga: MangaItem[] = [];
	if (mangaError || !manga) {
		console.log('RPC not available, falling back to simple random');
		const { data: fallback, error: fallbackError } = await supabase
			.from('manga')
			.select('id, title, feature_image_url')
			.range(from, to);

		if (fallbackError || !fallback) {
			console.error('Error fetching manga:', fallbackError);
			throw new Error('Failed to load manga');
		}

		// Shuffle the results client-side (less ideal but works)
		fallbackManga = fallback
			.map(item => ({ ...item, _sortKey: Math.random() }))
			.sort((a, b) => a._sortKey - b._sortKey)
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

	const total = totalCount ?? 0;
	const totalPages = Math.ceil(total / PAGE_SIZE);
	const isFirstPage = page === 1;

	return {
		comics,
		total,
		page,
		seed, // Include seed for consistent pagination
		meta: {
			title: isFirstPage
				? 'nHentai Pics | Read Hentai, Doujinshi, and Latest Pictures'
				: `Popular Hentai | Page ${page} | nHentai `,
			description: isFirstPage
				? 'Discover popular manga, hentai, and doujinshi that others are reading on NHentai. Find trending adult comics and community favorites!'
				: `Browse page ${page} of popular hentai selections. Discover trending adult comics, hentai and doujinshi. Nhentai Alternative | Rule 34 Alternative`,
			prev: page > 1 ? `/?page=${page - 1}&seed=${seed}` : null,
			next: page < totalPages ? `/?page=${page + 1}&seed=${seed}` : null
		}
	} as const;
};