<script lang="ts">
	import { onMount } from 'svelte'
	import { supabase } from '$lib/supabaseClient'
	
	export let data
	
	$: ({ user } = data || {})
	let userEmail = user?.email || ''
	
	// No need to fetch user again since we have it from layout data
	// onMount is only needed if we want to do something else
</script>

<div class="px-4 py-6 sm:px-0">
	<div class="border-4 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-8">
		<div class="text-center">
			<h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
				Welcome to Admin Dashboard
			</h2>
			<p class="text-gray-600 dark:text-gray-400 mb-8">
				Manage your manga collection and website content from here.
			</p>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-md mx-auto">
				<a
					href="/boleng-admin/dashboard/manga"
					class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 block text-center"
				>
					📚 Manga Management
				</a>
				<a
					href="/boleng-admin/dashboard/tags"
					class="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 block text-center"
				>
					🏷️ Tag Management
				</a>
			</div>

			<div class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
				<p class="text-sm text-gray-500 dark:text-gray-400">
					Logged in as: <strong>{userEmail || 'Admin'}</strong>
				</p>
			</div>
		</div>
	</div>
</div>