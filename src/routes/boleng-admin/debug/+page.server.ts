import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
	// Check environment variables on the server side
	const serverEnv = {
		PUBLIC_SUPABASE_URL: process.env.PUBLIC_SUPABASE_URL,
		PUBLIC_SUPABASE_ANON_KEY: process.env.PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
		NODE_ENV: process.env.NODE_ENV,
		// Check if the file exists
		envFileExists: 'Unknown'
	}

	console.log('=== SERVER ENVIRONMENT DEBUG ===')
	console.log('Environment variables:', serverEnv)
	
	return {
		serverEnv
	}
}