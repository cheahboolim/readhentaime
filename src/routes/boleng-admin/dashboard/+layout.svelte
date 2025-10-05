<script lang="ts">
	import { onMount, onDestroy } from 'svelte'
	import { supabase } from '$lib/supabaseClient'
	import { goto } from '$app/navigation'
	
	export let data

	// Get the session data from the server-side load
	$: ({ session, user } = data)

	let loading = false
	let authSubscription: any = null

	onMount(async () => {
		// Since server-side has already verified authentication,
		// we only need to listen for auth state changes
		authSubscription = supabase.auth.onAuthStateChange((event, newSession) => {
			if (event === 'SIGNED_OUT' || !newSession || newSession.user.email !== 'cheahboolim@gmail.com') {
				goto('/boleng-admin')
			}
		})
	})

	onDestroy(() => {
		if (authSubscription) {
			authSubscription.data?.subscription?.unsubscribe()
		}
	})

	async function handleSignOut() {
		await supabase.auth.signOut()
		// Navigation will be handled by the auth state change listener
	}
</script>

<svelte:head>
	<title>Admin Dashboard</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	<!-- Admin Navigation -->
	<nav class="bg-white dark:bg-gray-800 shadow">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between h-16">
				<div class="flex">
					<div class="flex-shrink-0 flex items-center">
						<h1 class="text-xl font-bold text-gray-900 dark:text-gray-100">
							Admin Dashboard
						</h1>
					</div>
					<div class="ml-6 flex space-x-8">
						<a
							href="/boleng-admin/dashboard"
							class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-300 dark:hover:text-gray-100 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
						>
							Overview
						</a>
						<a
							href="/boleng-admin/dashboard/manga"
							class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-300 dark:hover:text-gray-100 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
						>
							Manga Management
						</a>
						<a
							href="/boleng-admin/dashboard/tags"
							class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-300 dark:hover:text-gray-100 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
						>
							Tag Management
						</a>
					</div>
				</div>
				<div class="flex items-center space-x-4">
					<span class="text-sm text-gray-700 dark:text-gray-300">
						{user?.email || 'Admin'}
					</span>
					<button
						on:click={handleSignOut}
						class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
					>
						Sign Out
					</button>
				</div>
			</div>
		</div>
	</nav>

	<!-- Main Content -->
	<main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
		<slot />
	</main>
</div>