<script lang="ts">
	import SearchBanner from '$lib/components/SearchBanner.svelte'
	import RandomHome from '$lib/components/RandomHome.svelte'
	import VisitorAds from '$lib/components/VisitorAds.svelte'
	import AppInstallBanner from '$lib/components/AppInstallBanner.svelte'
	import AAdsBanner from '$lib/components/AAdsBanner.svelte'
	import Coinpoll from '$lib/components/ownads/coinpoll.svelte'
	import GgBetAds from '$lib/components/ownads/ggbetads.svelte'
	export let data
</script>

<svelte:head>
	<title>{data.meta.title}</title>
	<meta name="description" content={data.meta.description} />
	{#if data.meta.prev}
		<link rel="prev" href={data.meta.prev} />
	{/if}
	{#if data.meta.next}
		<link rel="next" href={data.meta.next} />
	{/if}
	<!-- Homepage should be indexed -->
	<meta name="robots" content="index, follow" />

	<!-- Open Graph tags for social sharing -->
	<meta property="og:title" content={data.meta.title} />
	<meta property="og:description" content={data.meta.description} />
	<meta property="og:type" content="website" />
	<meta
		property="og:image"
		content="{import.meta.env.PUBLIC_CDN_BASE_URL}/main/Read Hentai-home.jpg"
	/>
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:type" content="image/jpeg" />
	<meta property="og:url" content="https://readhentai.me" />
	<meta property="og:site_name" content="Read Hentai" />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta
		name="twitter:image"
		content="{import.meta.env.PUBLIC_CDN_BASE_URL}/main/Read Hentai-home.jpg"
	/>
	<meta name="twitter:title" content={data.meta.title} />
	<meta name="twitter:description" content={data.meta.description} />
</svelte:head>

<main class="max-w-6xl mx-auto px-4 py-8">
	<!-- Hero Search Banner -->
	<SearchBanner />
	
	<!-- Visitor Ads -->
	<VisitorAds />
	
	<!-- For You Section -->
	<RandomHome comics={data.comics} page={data.page} total={data.total} seed={data.seed} />
	
	<!-- Responsive Ad Section (after Load More Manga) -->
	<div class="container mx-auto px-4 py-4">
		<div class="flex flex-col lg:flex-row justify-center items-center gap-4 lg:gap-6">
			<div class="flex justify-center">
				<AAdsBanner />
			</div>
			<div class="flex justify-center">
				<Coinpoll />
			</div>
			<div class="flex justify-center">
				<GgBetAds />
			</div>
		</div>
	</div>
	
	<!-- App Install Banner (after Load More Manga) -->
	<div class="container mx-auto px-4 py-2">
		<AppInstallBanner />
	</div>
</main>