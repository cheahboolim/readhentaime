<!-- src/lib/components/aads/AAdsMiddleBanner.svelte -->
<div class="aads-middle-banner-container">
  <iframe
    title="AADS Banner Ad 320x50"
    data-aa='2408909'
    src='//ad.a-ads.com/2408909/?size=320x50'
    class="aads-middle-banner-iframe"
  ></iframe>
</div>

<style>
.aads-middle-banner-container {
  /* Create isolated stacking context above modals */
  isolation: isolate;
  position: relative;
  z-index: 1000; /* Above modal z-50 */

  /* Layout */
  width: 320px;
  margin: auto;
  height: auto;
}

.aads-middle-banner-iframe {
  /* Ad styling */
  border: 0;
  padding: 0;
  width: 320px;
  height: 50px;
  overflow: hidden;
  display: block;
  margin: auto;

  /* Ensure clicks work */
  pointer-events: auto;

  /* Hardware acceleration for better performance */
  transform: translateZ(0);
}
</style>
