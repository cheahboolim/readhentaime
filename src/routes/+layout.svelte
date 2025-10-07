<script>
	// Keep your existing imports
	import { browser } from '$app/environment'
	import '../app.css'
	import { onMount } from 'svelte'
	import { page } from '$app/stores'
	import { afterNavigate } from '$app/navigation'
	import { seo } from '$lib/seo'
	import MainNav from '$lib/components/MainNav.svelte'
	import Footer from '$lib/components/Footer.svelte'
	import ConversionTracker from '$lib/components/exoclicks/ConversionTracker.svelte'
	import ConversionDebug from '$lib/components/exoclicks/ConversionDebug.svelte'
	// import AgeVerificationModal from '$lib/components/AgeVerificationModal.svelte'
	import AdBlockDetector from '$lib/components/AdBlockDetector.svelte'
	import { supabase } from '$lib/supabaseClient'
	// ✅ Moved visitor ads to individual pages

	// Check if current user is admin using client-side supabase
	let isAdmin = false
	
	onMount(async () => {
		const { data: { user } } = await supabase.auth.getUser()
		isAdmin = user?.email === 'cheahboolim@gmail.com'
	})
</script>

<svelte:head>
	<meta name="theme-color" content="#000000" />
	<meta name="msapplication-TileColor" content="#000000" />
	<link rel="manifest" href="/manifest.json" />

	<link
		rel="icon"
		type="image/png"
		sizes="16x16"
		href="{import.meta.env.PUBLIC_CDN_BASE_URL}/favicon/favicon-16x16.png"
	/>
	<link
		rel="icon"
		type="image/png"
		sizes="32x32"
		href="{import.meta.env.PUBLIC_CDN_BASE_URL}/favicon/favicon-32x32.png"
	/>
	<link rel="icon" href="{import.meta.env.PUBLIC_CDN_BASE_URL}/favicon/favicon.ico" sizes="any" />
	<link
		rel="apple-touch-icon"
		href="{import.meta.env.PUBLIC_CDN_BASE_URL}/favicon/apple-touch-icon.png"
	/>
	<link
		rel="icon"
		type="image/png"
		sizes="192x192"
		href="{import.meta.env.PUBLIC_CDN_BASE_URL}/favicon/android-chrome-192x192.png"
	/>
	<link
		rel="icon"
		type="image/png"
		sizes="512x512"
		href="{import.meta.env.PUBLIC_CDN_BASE_URL}/favicon/android-chrome-512x512.png"
	/>

	<!-- ✅ Google Analytics removed -->
</svelte:head>

<div class="relative flex min-h-screen flex-col bg-background text-foreground antialiased">
	<MainNav />

	<main class="flex-1">
		<slot />
	</main>

	<Footer />
	
	<!-- Essential components only (no visitor ads) -->
	<ConversionTracker />
	{#if isAdmin}
		<ConversionDebug />
	{/if}
	<!-- <AgeVerificationModal /> -->
	<AdBlockDetector />
</div>
