<script lang="ts">
	export let data

	console.log('=== CLIENT ENVIRONMENT DEBUG ===')
	console.log('Client environment:', {
		url: import.meta.env.PUBLIC_SUPABASE_URL,
		hasKey: !!import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
		mode: import.meta.env.MODE,
		dev: import.meta.env.DEV
	})
	console.log('Server environment:', data.serverEnv)
</script>

<h1>Environment Debug</h1>

<div class="p-4">
	<h2>Server Environment (from +page.server.ts):</h2>
	<pre>{JSON.stringify(data.serverEnv, null, 2)}</pre>
	
	<h2>Client Environment (from import.meta.env):</h2>
	<pre>{JSON.stringify({
		url: import.meta.env.PUBLIC_SUPABASE_URL,
		hasKey: !!import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
		mode: import.meta.env.MODE,
		dev: import.meta.env.DEV
	}, null, 2)}</pre>
</div>

<a href="/boleng-admin">← Back to Admin Login</a>