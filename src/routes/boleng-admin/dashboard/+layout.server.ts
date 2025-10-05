import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession()

	// Check if user is logged in and is the admin
	if (!session || session.user.email !== 'cheahboolim@gmail.com') {
		throw redirect(303, '/boleng-admin')
	}

	return {
		session,
		supabase
	}
}