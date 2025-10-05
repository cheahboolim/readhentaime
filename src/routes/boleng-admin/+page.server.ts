import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession()

	// If user is already logged in, redirect to admin dashboard
	if (session) {
		// Check if the user is the admin user
		if (session.user.email === 'cheahboolim@gmail.com') {
			throw redirect(303, '/boleng-admin/dashboard')
		} else {
			// Not the admin user, sign them out and show login
			await supabase.auth.signOut()
		}
	}

	return {
		session,
		supabase
	}
}