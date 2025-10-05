import type { LayoutLoad } from './$types'
import { supabase } from '$lib/supabaseClient'
import { redirect } from '@sveltejs/kit'

export const load: LayoutLoad = async () => {
	console.log('=== SIMPLE AUTH CHECK ===')
	
	const { data: { session } } = await supabase.auth.getSession()
	
	console.log('Session status:', {
		hasSession: !!session,
		userEmail: session?.user?.email
	})
	
	const authorizedEmails = ['cheahboolim@gmail.com', 'testuser@gmail.com']
	
	if (!session || !session.user?.email || !authorizedEmails.includes(session.user.email)) {
		console.log('No valid session - redirecting to login')
		throw redirect(302, '/boleng-admin')
	}

	console.log('Valid session found - allowing access')
	
	return {
		session,
		user: session.user
	}
}