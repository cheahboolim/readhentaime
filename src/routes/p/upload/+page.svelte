<script lang="ts">
	import { goto } from '$app/navigation';
	import VisitorAds from '$lib/components/VisitorAds.svelte'
	import AAdsBanner from '$lib/components/AAdsBanner.svelte'
	import Coinpoll from '$lib/components/ownads/coinpoll.svelte'
	import GgBetAds from '$lib/components/ownads/ggbetads.svelte'
</script>

<main class="min-h-screen flex flex-col items-center justify-center px-4 text-center">
	<!-- Visitor Ads -->
	<VisitorAds />

	<h1 class="text-4xl font-bold mb-4 text-white">
		🚧 Feature Temporarily Unavailable
	</h1>
	<p class="text-muted-foreground text-lg mb-6">
		This feature is currently under maintenance. Please check back later.
	</p>
	<button
		on:click={() => goto('/')}
		class="text-black bg-white hover:bg-gray-100 px-4 py-2 rounded"
	>
		← Back to Home
	</button>

	<!-- Bottom Ad Trio -->
	<div class="container mx-auto px-4 py-4 mt-8">
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
</main>
