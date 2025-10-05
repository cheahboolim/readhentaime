<script>
	import { browser } from '$app/environment'
	import AAdsMiddleBanner from './AAdsMiddleBanner.svelte'
	import AppInstallBanner from './AppInstallBanner.svelte'
	import AAdsBanner from './AAdsBanner.svelte'
	import Coinpoll from './ownads/coinpoll.svelte'
	import GgBetAds from './ownads/ggbetads.svelte'
	import InterstitialAd from './exoclicks/InterstitialAd.svelte'
	import VideoSliderAd from './exoclicks/VideoSliderAd.svelte'
</script>

{#if browser}
	<!-- Top Banner -->
	<div class="container mx-auto px-4 py-2">
		<AAdsMiddleBanner />
	</div>

	<!-- Responsive Ad Section -->
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

	<!-- App Install Banner -->
	<div class="container mx-auto px-4 py-2">
		<AppInstallBanner />
	</div>

	<!-- ExoClick Interactive Ads -->
	<InterstitialAd />
	<VideoSliderAd />
{/if}