import { fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { createServerClient } from '@supabase/ssr'
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'
import type { Cookies } from '@sveltejs/kit'

// Helper function to create supabase client (no auth checks since RLS is disabled)
function createSupabaseClient(cookies: Cookies) {
	const supabaseUrl = PUBLIC_SUPABASE_URL || 'https://alpzbhtmdlvaitvudare.supabase.co'
	const supabaseAnonKey = 
		PUBLIC_SUPABASE_ANON_KEY || 
		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFscHpiaHRtZGx2YWl0dnVkYXJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MjgyNTIsImV4cCI6MjA3NDMwNDI1Mn0.WD5NrdFss6SEz3Bz1P3wE5dYxPWFBtmmi7fxrFT9mv4'
	
	return createServerClient(supabaseUrl, supabaseAnonKey, {
		cookies: {
			get: (key) => cookies.get(key),
			set: (key, value, options) => cookies.set(key, value, { path: '/', ...options }),
			remove: (key, options) => cookies.delete(key, { path: '/', ...options })
		}
	})
}

export const load: PageServerLoad = async ({ url, cookies }) => {
	try {
		console.log('Loading manga page...')
		const supabase = createSupabaseClient(cookies)

		const page = Number(url.searchParams.get('page') ?? 1)
		const limit = 50
		const searchTerm = url.searchParams.get('search') ?? ''
		const tagFilter = url.searchParams.get('tag') ?? ''

		const from = (page - 1) * limit
		const to = page * limit - 1

		console.log('Fetching manga data...')

		// Build query with optional filters
		let query = supabase
			.from('manga')
			.select('id, title, feature_image_url', { count: 'exact' })

		// Apply search filter if provided
		if (searchTerm) {
			query = query.ilike('title', `%${searchTerm}%`)
		}

		// Apply tag filter if provided
		if (tagFilter) {
			// For tag filtering, we need to join with manga_tags table
			const { data: filteredMangaIds } = await supabase
				.from('manga_tags')
				.select('manga_id')
				.eq('tag_id', tagFilter)
			
			const mangaIds = filteredMangaIds?.map(m => m.manga_id) || []
			if (mangaIds.length > 0) {
				query = query.in('id', mangaIds)
			} else {
				// No manga with this tag, return empty result
				return {
					manga: [],
					count: 0,
					page,
					limit,
					tags: tags ?? []
				}
			}
		}

		const { data: manga, error: mangaError, count } = await query
			.order('created_at', { ascending: false })
			.range(from, to)

		if (mangaError) {
			console.error('Error fetching manga:', mangaError)
			return {
				manga: [],
				count: 0,
				page,
				limit,
				tags: [],
				error: 'Could not fetch manga posts. Check server logs for details.'
			}
		}

		console.log('Manga fetched successfully:', manga?.length || 0, 'items')

		// Fetch tags
		const { data: tags, error: tagsError } = await supabase
			.from('tags')
			.select('id, name')
			.order('name', { ascending: true })

		if (tagsError) {
			console.error('Error fetching tags:', tagsError)
		}

		console.log('Tags fetched successfully:', tags?.length || 0, 'items')

		// Fetch slugs for manga
		const mangaIds = manga?.map((m) => m.id) || []
		const { data: slugData } = await supabase
			.from('slug_map')
			.select('manga_id, slug')
			.in('manga_id', mangaIds)

		// Create a map of manga_id to slug
		const slugMap = new Map(slugData?.map((s) => [s.manga_id, s.slug]) || [])

		// Map slugs to manga
		const mangaWithSlugs = manga?.map((m) => ({
			...m,
			slug: slugMap.get(m.id) || null
		})) || []

		return {
			manga: mangaWithSlugs,
			count: count ?? 0,
			page,
			limit,
			tags: tags ?? []
		}
	} catch (error) {
		console.error('Unexpected error in load function:', error)
		return {
			manga: [],
			count: 0,
			page: 1,
			limit: 50,
			tags: [],
			error: 'Unexpected server error occurred'
		}
	}
}

// Helper function to delete manga and all related records
async function deleteMangaWithRelations(supabase: any, mangaId: string) {
	// Delete from junction tables first (due to foreign key constraints)
	const junctionTables = [
		'manga_artists',
		'manga_categories',
		'manga_characters',
		'manga_groups',
		'manga_languages',
		'manga_parodies',
		'manga_tags',
		'pages',
		'slug_map'
	]

	for (const table of junctionTables) {
		const { error } = await supabase
			.from(table)
			.delete()
			.eq('manga_id', mangaId)
		
		if (error) {
			console.error(`Error deleting from ${table}:`, error)
			// Continue even if there's an error (record might not exist)
		}
	}

	// Finally, delete the manga itself
	const { error: mangaError, data: deletedManga } = await supabase
		.from('manga')
		.delete()
		.eq('id', mangaId)
		.select()

	return { error: mangaError, data: deletedManga }
}

export const actions: Actions = {
	deletePost: async ({ request, cookies }) => {
		try {
			const supabase = createSupabaseClient(cookies)

			console.log('=== MANGA DELETION (NO AUTH REQUIRED) ===')

			const formData = await request.formData()
			const id = formData.get('id') as string
			if (!id) return fail(400, { message: 'Invalid request, post ID is missing.' })

			console.log('Attempting to delete manga with ID:', id)

			const { error, data: deletedManga } = await deleteMangaWithRelations(supabase, id)

			if (error) {
				console.error('Error deleting manga:', error)
				return fail(500, { message: `Failed to delete manga: ${error.message}` })
			}

			console.log('Manga deletion result:', deletedManga)

			if (!deletedManga || deletedManga.length === 0) {
				console.error('No manga was deleted')
				return fail(500, { message: 'Manga deletion failed - no rows affected.' })
			}

			return { success: true, message: 'Manga deleted successfully.' }
		} catch (error: unknown) {
			console.error('Delete operation failed:', error)
			return fail(500, { message: `Failed to delete manga: ${error}` })
		}
	},

	updatePost: async ({ request, cookies }) => {
		try {
			const supabase = createSupabaseClient(cookies)

			console.log('=== MANGA UPDATE (NO AUTH REQUIRED) ===')

			const formData = await request.formData()
			const id = formData.get('id') as string
			const title = formData.get('title') as string

			if (!id || !title) {
				return fail(400, { message: 'Invalid request, ID and title are required.' })
			}

			console.log('Attempting to update manga:', id, 'with title:', title)

			const { error, data: updatedManga } = await supabase
				.from('manga')
				.update({ title })
				.eq('id', id)
				.select()

			if (error) {
				console.error('Error updating manga:', error)
				return fail(500, { message: `Failed to update manga: ${error.message}` })
			}

			if (!updatedManga || updatedManga.length === 0) {
				console.error('No manga was updated')
				return fail(500, { message: 'Manga update failed - no rows affected.' })
			}

			console.log('Manga updated successfully:', updatedManga)

			return { success: true, message: 'Manga updated successfully.' }
		} catch (error: unknown) {
			console.error('Update operation failed:', error)
			return fail(500, { message: `Failed to update manga: ${error}` })
		}
	},

	deleteSelected: async ({ request, cookies }) => {
		try {
			const supabase = createSupabaseClient(cookies)

			console.log('=== BULK MANGA DELETION (NO AUTH REQUIRED) ===')

			const formData = await request.formData()
			const selectedIdsStr = formData.get('selectedIds') as string
			
			if (!selectedIdsStr) {
				return fail(400, { message: 'No manga selected for deletion.' })
			}

			const selectedIds = selectedIdsStr.split(',').filter(id => id.trim())
			
			if (selectedIds.length === 0) {
				return fail(400, { message: 'No valid manga IDs provided.' })
			}

			console.log(`Attempting to delete ${selectedIds.length} manga...`)

			let successCount = 0
			let failCount = 0

			// Delete each manga individually to ensure proper cascade
			for (const id of selectedIds) {
				const { error } = await deleteMangaWithRelations(supabase, id)
				if (error) {
					console.error(`Failed to delete manga ${id}:`, error)
					failCount++
				} else {
					successCount++
				}
			}

			console.log(`Deletion complete: ${successCount} succeeded, ${failCount} failed`)

			if (successCount === 0) {
				return fail(500, { message: 'Failed to delete any manga.' })
			}

			const message = failCount > 0 
				? `Deleted ${successCount} manga. ${failCount} failed.`
				: `Successfully deleted ${successCount} manga.`

			return { success: true, message }
		} catch (error: unknown) {
			console.error('Bulk delete operation failed:', error)
			return fail(500, { message: `Failed to delete manga: ${error}` })
		}
	}
}