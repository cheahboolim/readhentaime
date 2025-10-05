import type { Actions } from './$types'
import { redirect, fail } from '@sveltejs/kit'
import { createServerClient } from '@supabase/ssr'
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'

// Fallback values for environment variables (same as in supabaseClient.ts)
const supabaseUrl = PUBLIC_SUPABASE_URL || 'https://alpzbhtmdlvaitvudare.supabase.co'
const supabaseAnonKey = PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFscHpiaHRtZGx2YWl0dnVkYXJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MjgyNTIsImV4cCI6MjA3NDMwNDI1Mn0.WD5NrdFss6SEz3Bz1P3wE5dYxPWFBtmmi7fxrFT9mv4'

console.log('=== ADMIN SERVER DEBUG ===')
console.log('Supabase URL available:', !!supabaseUrl)
console.log('Supabase Key available:', !!supabaseAnonKey)

export const actions: Actions = {
	signin: async ({ request, cookies }) => {
		try {
			console.log('=== SERVER-SIDE SIGN IN ACTION ===')
			
			const formData = await request.formData()
			const email = formData.get('email') as string
			const password = formData.get('password') as string

			console.log('Attempting server-side sign in for:', email)

			if (!supabaseUrl || !supabaseAnonKey) {
				console.error('Missing Supabase configuration')
				return fail(500, { 
					message: 'Server configuration error. Please contact administrator.' 
				})
			}

			const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
				cookies: {
					get: (key) => cookies.get(key),
					set: (key, value, options) => {
						console.log('Setting cookie:', key)
						cookies.set(key, value, { 
							path: '/', 
							httpOnly: true,
							secure: true,
							sameSite: 'lax',
							maxAge: 60 * 60 * 24 * 7, // 7 days
							...options 
						})
					},
					remove: (key, options) => {
						console.log('Removing cookie:', key)
						cookies.delete(key, { path: '/', ...options })
					}
				}
			})

			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password
			})

			console.log('Server sign in result:', {
				hasSession: !!data.session,
				hasUser: !!data.user,
				userEmail: data.user?.email,
				error: error?.message
			})

			if (error) {
				console.error('Server sign in error:', error)
				return fail(400, { error: error.message })
			}

			if (!data.session || !data.user) {
				return fail(400, { error: 'No session created' })
			}

			// Check if user is authorized
			const authorizedEmails = ['cheahboolim@gmail.com', 'testuser@gmail.com']
			if (!data.user?.email || !authorizedEmails.includes(data.user.email)) {
				console.log('Unauthorized user:', data.user.email)
				return fail(403, { error: 'Unauthorized email address' })
			}

			console.log('Server sign in successful! Redirecting to dashboard...')
			throw redirect(302, '/boleng-admin/dashboard')
		} catch (error) {
			console.error('Unexpected error in signin action:', error)
			return fail(500, { 
				error: 'Internal server error. Please try again later.' 
			})
		}
	}
}