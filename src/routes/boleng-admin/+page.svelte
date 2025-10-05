<script lang="ts">
	import { enhance } from '$app/forms'
	import { page } from '$app/stores'
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'
	import { supabase } from '$lib/supabaseClient'

	let email = 'cheahboolim@gmail.com'
	let password = ''
	let loading = false
	let error = ''

	// Test functions for debugging
	async function testConnection() {
		console.log('=== CONNECTION TEST ===')
		try {
			const { data, error } = await supabase.auth.getSession()
			console.log('Connection test result:', { data, error })
			alert(`Connection test: ${error ? 'FAILED - ' + error.message : 'SUCCESS'}`)
		} catch (err) {
			console.error('Connection test error:', err)
			alert('Connection test FAILED: ' + err.message)
		}
	}

	function testEnvironment() {
		console.log('=== ENVIRONMENT TEST ===')
		const env = {
			url: import.meta.env.PUBLIC_SUPABASE_URL,
			hasKey: !!import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
			mode: import.meta.env.MODE,
			dev: import.meta.env.DEV
		}
		console.log('Environment:', env)
		alert(`Environment: URL=${env.url ? 'SET' : 'MISSING'}, Key=${env.hasKey ? 'SET' : 'MISSING'}`)
	}

	// Check if already logged in as admin
	onMount(async () => {
		try {
			const { data: { session } } = await supabase.auth.getSession()
			const authorizedEmails = ['cheahboolim@gmail.com', 'testuser@gmail.com']
			if (session && authorizedEmails.includes(session.user.email)) {
				goto('/boleng-admin/dashboard')
			}
		} catch (err) {
			console.error('Session check error:', err)
		}
	})

	// Handle form submission
	async function handleSignIn() {
		loading = true
		error = ''

		try {
			console.log('=== AUTHENTICATION DEBUG ===')
			console.log('1. Starting sign in process...')
			console.log('2. Email:', email)
			console.log('3. Supabase client:', supabase)
			console.log('4. Environment check:', {
				url: import.meta.env.PUBLIC_SUPABASE_URL,
				hasKey: !!import.meta.env.PUBLIC_SUPABASE_ANON_KEY
			})
			
			// Test if supabase client is working
			console.log('5. Testing Supabase connection...')
			const { data: testData, error: testError } = await supabase.auth.getSession()
			console.log('6. Current session test:', { testData, testError })
			
			console.log('7. Attempting authentication...')
			const { data, error: signInError } = await supabase.auth.signInWithPassword({
				email: email.trim(),
				password: password
			})

			console.log('8. Sign in response:', { 
				data, 
				error: signInError,
				hasSession: !!data?.session,
				hasUser: !!data?.user,
				userEmail: data?.user?.email
			})

			if (signInError) {
				error = `Authentication Error: ${signInError.message}`
				console.error('9. Sign in error details:', signInError)
			} else if (data.session && data.user) {
				console.log('10. Authentication successful!')
				console.log('11. User details:', {
					email: data.user.email,
					id: data.user.id,
					confirmed: data.user.email_confirmed_at
				})
				
				// Verify the user is authorized (admin or test user)
				const authorizedEmails = ['cheahboolim@gmail.com', 'testuser@gmail.com']
				if (authorizedEmails.includes(data.user.email)) {
					console.log('12. User verified! Email:', data.user.email, 'Attempting redirect...')
					
					// Show success message first
					error = 'Login successful! Redirecting...'
					
					console.log('13. Attempting to set session for server-side access...')
					
					// Force a page reload to ensure server picks up the session
					setTimeout(() => {
						console.log('14. Executing hard redirect with page reload...')
						window.location.href = '/boleng-admin/dashboard'
					}, 1000)
				} else {
					error = `Unauthorized email: ${data.user.email}`
				}
			} else {
				error = 'Authentication failed: No session or user returned'
				console.error('9. No session/user in response')
			}
		} catch (err) {
			console.error('10. Exception during sign in:', err)
			error = `Exception: ${err.message}`
		}
		
		loading = false
	}
</script>

<svelte:head>
	<title>Admin Access</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full space-y-8">
		<div>
			<h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
				Admin Access
			</h2>
			<p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
				Authorized personnel only
			</p>
		</div>

		<form class="mt-8 space-y-6" on:submit|preventDefault={handleSignIn}>
			<div class="rounded-md shadow-sm -space-y-px">
				<div>
					<label for="email" class="sr-only">Email address</label>
					<input
						id="email"
						name="email"
						type="email"
						autocomplete="email"
						required
						bind:value={email}
						readonly
						class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-gray-100"
					/>
				</div>
				<div>
					<label for="password" class="sr-only">Password</label>
					<input
						id="password"
						name="password"
						type="password"
						autocomplete="current-password"
						required
						bind:value={password}
						placeholder="Password"
						class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
					/>
				</div>
			</div>

			{#if error}
				<div class="rounded-md bg-red-50 p-4">
					<div class="text-sm text-red-700">
						{error}
					</div>
				</div>
			{/if}

			<div>
				<button
					type="submit"
					disabled={loading}
					class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{#if loading}
						<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						Signing in...
					{:else}
						Sign in
					{/if}
				</button>
			</div>
		</form>

		<!-- Server-side authentication form -->
		<div class="mt-4">
			<form method="POST" action="?/signin" class="w-full">
				<input type="hidden" name="email" value={email} />
				<input type="hidden" name="password" value={password} />
				<button
					type="submit"
					class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
				>
					Sign in (Server-side - Try This!)
				</button>
			</form>
		</div>

		<div class="text-center">
			<a href="/" class="text-sm text-indigo-600 hover:text-indigo-500">
				← Back to site
			</a>
			
			<!-- Enhanced Debug Panel -->
			<div class="mt-4 p-4 bg-gray-100 rounded text-xs">
				<h3 class="font-bold mb-2">Debug Panel</h3>
				<div class="space-y-2">
					<button 
						on:click={async () => {
							const { data } = await supabase.auth.getSession()
							console.log('Current session:', data)
							alert('Check console for session data')
						}}
						class="block w-full text-blue-600 underline"
					>
						Test Session
					</button>
					<button 
						on:click={testConnection}
						class="block w-full text-green-600 underline"
					>
						Test Connection
					</button>
					<button 
						on:click={testEnvironment}
						class="block w-full text-purple-600 underline"
					>
						Test Environment
					</button>
				</div>
			</div>
		</div>
	</div>
</main>

<style>
	/* Dark mode styles */
	:global(.dark) input {
		background-color: #374151;
		border-color: #4b5563;
		color: #f9fafb;
	}
	
	:global(.dark) input::placeholder {
		color: #9ca3af;
	}
	
	:global(.dark) input:focus {
		border-color: #6366f1;
		ring-color: #6366f1;
	}
</style>