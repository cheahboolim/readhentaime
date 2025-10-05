import { fail } from '@sveltejs/kit'
import type { Actions } from './$types'
import { createServerClient } from '@supabase/ssr'
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'
import type { Cookies } from '@sveltejs/kit'

// Helper function to create authenticated supabase client for admin operations
function createAdminSupabaseClient(cookies: Cookies) {
	return createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			get: (key) => cookies.get(key),
			set: (key, value, options) => cookies.set(key, value, { path: '/', ...options }),
			remove: (key, options) => cookies.delete(key, { path: '/', ...options })
		}
	})
}

export const load = async ({ url, cookies, parent }) => {
	// Get authenticated session from parent layout
	const parentData = await parent()

	const supabase = createAdminSupabaseClient(cookies)

	const page = Number(url.searchParams.get('page') ?? 1)
	const limit = 50
	const searchTerm = url.searchParams.get('search') ?? ''
	const tagFilter = url.searchParams.get('tag') ?? ''

	const from = (page - 1) * limit
	const to = page * limit - 1

	let mangaQuery
	const queryBuilder = supabase.from('manga')

	if (tagFilter) {
		mangaQuery = queryBuilder
			.select('id, title, feature_image_url, manga_tags!inner(tag_id)', { count: 'exact' })
			.eq('manga_tags.tag_id', tagFilter)
	} else {
		mangaQuery = queryBuilder.select('id, title, feature_image_url', { count: 'exact' })
	}

	if (searchTerm) {
		mangaQuery = mangaQuery.ilike('title', `%${searchTerm}%`)
	}

	const {
		data: manga,
		error: mangaError,
		count
	} = await mangaQuery.order('created_at', { ascending: false }).range(from, to)

	if (mangaError) {
		console.error('Error fetching manga:', mangaError)
		return {
			...parentData,
			manga: [],
			count: 0,
			page,
			limit,
			tags: [],
			error: 'Could not fetch manga posts. Check server logs for details.'
		}
	}

	// Fetch slug mappings for all manga
	let mangaWithSlugs = manga
	if (manga && manga.length > 0) {
		const mangaIds = manga.map((m) => m.id)
		const { data: slugMappings } = await supabase
			.from('slug_map')
			.select('manga_id, slug')
			.in('manga_id', mangaIds)

		// Merge slug data with manga data
		mangaWithSlugs = manga.map((m) => {
			const slugData = slugMappings?.find((s) => s.manga_id === m.id)
			return {
				...m,
				slug: slugData?.slug || null
			}
		})
	}

	const { data: tags, error: tagsError } = await supabase
		.from('tags')
		.select('id, name')
		.order('name', { ascending: true })

	if (tagsError) {
		console.error('Error fetching tags:', tagsError)
	}

	return {
		...parentData,
		manga: mangaWithSlugs ?? [],
		count: count ?? 0,
		page,
		limit,
		tags: tags ?? []
	}
}

export const actions: Actions = {
	deletePost: async ({ request, cookies }) => {
		const supabase = createAdminSupabaseClient(cookies)

		// Check if user is authenticated admin
		const {
			data: { session }
		} = await supabase.auth.getSession()
		if (!session || session.user.email !== 'cheahboolim@gmail.com') {
			return fail(401, { message: 'Unauthorized access.' })
		}

		const formData = await request.formData()
		const id = formData.get('id') as string
		if (!id) return fail(400, { message: 'Invalid request, post ID is missing.' })

		console.log('Attempting to delete manga with ID:', id)
		console.log('Authenticated user:', session.user.email, 'UUID:', session.user.id)

		// First, verify the manga exists
		const { data: existingManga, error: checkError } = await supabase
			.from('manga')
			.select('id, title')
			.eq('id', id)
			.single()

		if (checkError || !existingManga) {
			console.error('Manga not found:', checkError)
			return fail(404, { message: 'Manga not found.' })
		}

		console.log('Found manga to delete:', existingManga.title)

		// First, count existing relationships for logging
		const relationshipTables = [
			'pages',
			'manga_artists',
			'manga_categories',
			'manga_characters',
			'manga_groups',
			'manga_languages',
			'manga_parodies',
			'manga_tags',
			'slug_map'
		]

		console.log('Counting existing relationships before deletion...')
		for (const table of relationshipTables) {
			const { count, error } = await supabase
				.from(table)
				.select('*', { count: 'exact', head: true })
				.eq('manga_id', id)

			if (!error) {
				console.log(`Found ${count || 0} records in ${table} for manga ${id}`)
			}
		}

		// Delete all related records first, then the manga
		try {
			// Delete related records with detailed error checking
			const deleteResults = await Promise.allSettled([
				supabase.from('pages').delete().eq('manga_id', id).select(),
				supabase.from('manga_artists').delete().eq('manga_id', id).select(),
				supabase.from('manga_categories').delete().eq('manga_id', id).select(),
				supabase.from('manga_characters').delete().eq('manga_id', id).select(),
				supabase.from('manga_groups').delete().eq('manga_id', id).select(),
				supabase.from('manga_languages').delete().eq('manga_id', id).select(),
				supabase.from('manga_parodies').delete().eq('manga_id', id).select(),
				supabase.from('manga_tags').delete().eq('manga_id', id).select(),
				supabase.from('slug_map').delete().eq('manga_id', id).select()
			])

			// Check for any failures in related record deletions
			const failedDeletions = deleteResults.filter((result) => result.status === 'rejected')
			if (failedDeletions.length > 0) {
				console.error('Some related record deletions failed:', failedDeletions)
				failedDeletions.forEach((failure, index) => {
					console.error(`Failed deletion from ${relationshipTables[index]}:`, failure.reason)
				})
			}

			// Count successful deletions with table names
			let totalDeleted = 0
			deleteResults.forEach((result, index) => {
				if (result.status === 'fulfilled') {
					const deletedCount = Array.isArray(result.value.data) ? result.value.data.length : 0
					console.log(
						`Successfully deleted ${deletedCount} records from ${relationshipTables[index]}`
					)
					totalDeleted += deletedCount
				}
			})

			console.log(`Total relationship records deleted: ${totalDeleted}`)
			console.log(
				'Note: Entity tables (artists, tags, categories, etc.) are preserved for other manga'
			)

			// Finally delete the manga itself
			const { error, data: deletedManga } = await supabase
				.from('manga')
				.delete()
				.eq('id', id)
				.select()
			if (error) {
				console.error('Error deleting manga:', error)
				throw error
			}

			console.log('Manga deletion result:', deletedManga)

			if (!deletedManga || deletedManga.length === 0) {
				console.error('No manga was deleted - this might indicate a permissions issue')
				return fail(500, {
					message: 'Manga deletion failed - no rows affected. Check permissions.'
				})
			}

			return { success: true, message: 'Manga and all related pages deleted successfully.' }
		} catch (error: unknown) {
			console.error('Delete operation failed:', error)
			return fail(500, { message: `Failed to delete manga: ${error}` })
		}
	},
	deleteSelected: async ({ request, cookies }) => {
		const supabase = createAdminSupabaseClient(cookies)

		// Check if user is authenticated admin
		const {
			data: { session }
		} = await supabase.auth.getSession()
		if (!session || session.user.email !== 'cheahboolim@gmail.com') {
			return fail(401, { message: 'Unauthorized access.' })
		}

		const formData = await request.formData()
		const idsToDelete = (formData.get('selectedIds') as string)?.split(',')
		if (!idsToDelete || idsToDelete.length === 0)
			return fail(400, { message: 'No posts selected.' })

		console.log(`Starting bulk deletion of ${idsToDelete.length} manga:`, idsToDelete)

		// Delete all related records for selected manga, then the manga themselves
		try {
			// Count existing relationships for all manga being deleted
			const relationshipTables = [
				'pages',
				'manga_artists',
				'manga_categories',
				'manga_characters',
				'manga_groups',
				'manga_languages',
				'manga_parodies',
				'manga_tags',
				'slug_map'
			]

			let totalRelationshipCount = 0
			for (const table of relationshipTables) {
				const { count, error } = await supabase
					.from(table)
					.select('*', { count: 'exact', head: true })
					.in('manga_id', idsToDelete)

				if (!error) {
					console.log(`Found ${count || 0} total records in ${table} for selected manga`)
					totalRelationshipCount += count || 0
				}
			}

			console.log(`Total relationship records to delete: ${totalRelationshipCount}`)

			// Process all deletions in parallel for better performance
			const deleteOperations = []

			for (const id of idsToDelete) {
				deleteOperations.push(
					Promise.all([
						supabase.from('pages').delete().eq('manga_id', id).select(),
						supabase.from('manga_artists').delete().eq('manga_id', id).select(),
						supabase.from('manga_categories').delete().eq('manga_id', id).select(),
						supabase.from('manga_characters').delete().eq('manga_id', id).select(),
						supabase.from('manga_groups').delete().eq('manga_id', id).select(),
						supabase.from('manga_languages').delete().eq('manga_id', id).select(),
						supabase.from('manga_parodies').delete().eq('manga_id', id).select(),
						supabase.from('manga_tags').delete().eq('manga_id', id).select(),
						supabase.from('slug_map').delete().eq('manga_id', id).select()
					])
				)
			}

			await Promise.all(deleteOperations)
			console.log(`Completed relationship deletions for ${idsToDelete.length} manga`)

			// Finally delete the manga themselves
			const { error, data: deletedManga } = await supabase
				.from('manga')
				.delete()
				.in('id', idsToDelete)
				.select()

			if (error) throw error

			console.log(`Successfully deleted ${deletedManga?.length || 0} manga records`)
			console.log(
				'Note: Entity tables (artists, tags, categories, etc.) are preserved for other manga'
			)

			return {
				success: true,
				message: `${idsToDelete.length} manga and all related pages deleted successfully.`
			}
		} catch (error: unknown) {
			return fail(500, { message: `Failed to delete selected manga: ${error}` })
		}
	},
	updatePost: async ({ request, cookies }) => {
		const supabase = createAdminSupabaseClient(cookies)

		// Check if user is authenticated admin
		const {
			data: { session }
		} = await supabase.auth.getSession()
		if (!session || session.user.email !== 'cheahboolim@gmail.com') {
			return fail(401, { message: 'Unauthorized access.' })
		}

		const formData = await request.formData()
		const id = formData.get('id') as string
		const title = formData.get('title') as string

		if (!id || !title) return fail(400, { message: 'Invalid request data.' })

		const { error } = await supabase.from('manga').update({ title }).eq('id', id)

		if (error) {
			console.error('Error updating manga:', error)
			return fail(500, { message: 'Failed to update manga title.' })
		}

		return { success: true, message: 'Manga title updated successfully.' }
	}
}
