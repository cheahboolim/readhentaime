<!-- src/lib/components/Ads/AAdsBanner.svelte -->
<div class="aads-banner-container" data-ad="true" data-ad-type="aads-banner">
  <iframe
    title="AADS Banner Ad 300x250"
    data-aa="2408907"
    src="//ad.a-ads.com/2408907/?size=300x250"
    class="aads-banner-iframe"
  ></iframe>
</div>

<style>
.aads-banner-container {
  /* Create isolated stacking context above modals */
  isolation: isolate;
  position: relative;
  z-index: 1000; /* Above modal z-50 */

  /* Layout */
  width: 300px;
  margin: auto;
  height: auto;
}

.aads-banner-iframe {
  /* Ad styling */
  border: 0;
  padding: 0;
  width: 300px;
  height: 250px;
  overflow: hidden;
  display: block;
  margin: auto;

  /* Ensure clicks work */
  pointer-events: auto;

  /* Hardware acceleration for better performance */
  transform: translateZ(0);
}
</style>
