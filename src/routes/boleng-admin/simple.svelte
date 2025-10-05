<script lang="ts">
	import { supabase } from '$lib/supabaseClient'
	import { goto } from '$app/navigation'

	let email = 'testuser@gmail.com'
	let password = 'testuser'
	let loading = false
	let error = ''

	const handleLogin = async () => {
		loading = true
		error = ''

		console.log('Starting simple login...')
		
		const { data, error: signInError } = await supabase.auth.signInWithPassword({
			email,
			password
		})

		if (signInError) {
			error = signInError.message
			console.error('Login error:', signInError)
		} else if (data.user) {
			console.log('Login successful:', data.user.email)
			// Just redirect immediately - no complex checks
			goto('/boleng-admin/dashboard')
		}

		loading = false
	}
</script>

<svelte:head>
	<title>Admin Login</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50">
	<div class="max-w-md w-full space-y-8">
		<div>
			<h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
				Admin Access
			</h2>
		</div>
		
		<div class="mt-8 space-y-6">
			<div class="space-y-4">
				<div>
					<label for="email" class="block text-sm font-medium text-gray-700">Email</label>
					<input
						id="email"
						type="email"
						bind:value={email}
						class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
					/>
				</div>
				
				<div>
					<label for="password" class="block text-sm font-medium text-gray-700">Password</label>
					<input
						id="password"
						type="password"
						bind:value={password}
						class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
					/>
				</div>
			</div>

			{#if error}
				<div class="text-red-600 text-sm">{error}</div>
			{/if}

			<button
				on:click={handleLogin}
				disabled={loading}
				class="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
			>
				{loading ? 'Signing in...' : 'Sign In'}
			</button>
		</div>
		
		<div class="text-center">
			<a href="/" class="text-blue-600 hover:text-blue-500">← Back to site</a>
		</div>
	</div>
</div>