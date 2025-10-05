import { fail } from '@sveltejs/kit'
import type { PageServerLoad, Actions } from './$types'
import { createServerClient } from '@supabase/ssr'
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'

// Helper function to create authenticated supabase client for admin operations
function createAdminSupabaseClient(cookies: any) {
	return createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			get: (key) => cookies.get(key),
			set: (key, value, options) => cookies.set(key, value, options),
			remove: (key, options) => cookies.delete(key, options)
		}
	})
}

// A simple utility to convert a name into a URL-friendly slug
function slugify(text: string): string {
	return text
		.toString()
		.toLowerCase()
		.trim()
		.replace(/\s+/g, '-') // Replace spaces with -
		.replace(/[^\w-]+/g, '') // Remove all non-word chars
		.replace(/--+/g, '-') // Replace multiple - with single -
}

export const load: PageServerLoad = async ({ cookies, parent }) => {
	// Get authenticated session from parent layout
	await parent()
	
	const supabase = createAdminSupabaseClient(cookies)

	// Fetch all tags, ordered alphabetically for easy management
	const { data: tags, error } = await supabase
		.from('tags')
		.select('id, name, slug')
		.order('name', { ascending: true })

	if (error) {
		console.error('Error loading tags:', error)
		return {
			tags: [],
			error: 'Could not fetch tags from the database.'
		}
	}

	return {
		tags: tags ?? []
	}
}

export const actions: Actions = {
	// Action to update a tag's name and slug
	updateTag: async ({ request, cookies }) => {
		const supabase = createAdminSupabaseClient(cookies)
		
		// Check if user is authenticated admin
		const { data: { session } } = await supabase.auth.getSession()
		if (!session || session.user.email !== 'cheahboolim@gmail.com') {
			return fail(401, { message: 'Unauthorized access.' })
		}

		const formData = await request.formData()

		const id = formData.get('id') as string
		const name = formData.get('name') as string

		if (!id || !name) {
			return fail(400, { message: 'Invalid request. ID and new name are required.' })
		}

		const slug = slugify(name)

		const { error } = await supabase.from('tags').update({ name, slug }).eq('id', id)

		if (error) {
			// Handle potential duplicate name/slug errors gracefully
			console.error('Error updating tag:', error)
			return fail(500, { message: 'Failed to update tag. This name might already exist.' })
		}

		return { success: true, message: 'Tag updated successfully.' }
	},

	// Action to delete a tag
	deleteTag: async ({ request, cookies }) => {
		const supabase = createAdminSupabaseClient(cookies)
		
		// Check if user is authenticated admin
		const { data: { session } } = await supabase.auth.getSession()
		if (!session || session.user.email !== 'cheahboolim@gmail.com') {
			return fail(401, { message: 'Unauthorized access.' })
		}

		const formData = await request.formData()
		const id = formData.get('id') as string

		if (!id) {
			return fail(400, { message: 'Invalid request. Tag ID is required.' })
		}

		const { error } = await supabase.from('tags').delete().eq('id', id)

		if (error) {
			console.error('Error deleting tag:', error)
			return fail(500, { message: 'Failed to delete tag.' })
		}

		return { success: true, message: 'Tag deleted successfully.' }
	}
}