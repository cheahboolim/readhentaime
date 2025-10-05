<script lang="ts">
	import { enhance } from '$app/forms'
	import { page } from '$app/stores'
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'
	import { createBrowserClient } from '@supabase/ssr'
	import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public'

	export let data

	let email = 'cheahboolim@gmail.com'
	let password = ''
	let loading = false
	let error = ''
	let supabase: any

	// Initialize Supabase client
	onMount(() => {
		supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY)
		
		// Check if already logged in as admin
		supabase.auth.getSession().then(({ data: { session } }) => {
			if (session && session.user.email === 'cheahboolim@gmail.com') {
				goto('/boleng-admin/dashboard')
			}
		})
	})

	// Handle form submission
	async function handleSignIn() {
		if (!supabase) return
		
		loading = true
		error = ''

		const { error: signInError } = await supabase.auth.signInWithPassword({
			email,
			password
		})

		if (signInError) {
			error = signInError.message
		} else {
			// Success will be handled by the client-side redirect
			goto('/boleng-admin/dashboard')
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

		<div class="text-center">
			<a href="/" class="text-sm text-indigo-600 hover:text-indigo-500">
				← Back to site
			</a>
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