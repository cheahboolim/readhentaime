<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  // ExoClick video slider configuration
  export let zoneId: string = "5742432";
  export let keywords: string = "keywords";
  export let sub: string = "123450000";
  export let blockAdTypes: string = "0";
  export let adProviderSrc: string = "https://a.magsrv.com/ad-provider.js";

  let adContainer: HTMLElement;

  onMount(() => {
    if (!browser) return;

    // Load the ad provider script
    const script = document.createElement('script');
    script.async = true;
    script.type = 'application/javascript';
    script.src = adProviderSrc;
    
    // Add the script to head
    document.head.appendChild(script);
    
    // Wait for script to load then initialize the ad
    script.onload = () => {
      // Initialize AdProvider
      if ((window as any).AdProvider) {
        (window as any).AdProvider.push({"serve": {}});
      } else {
        // Fallback if AdProvider is not immediately available
        setTimeout(() => {
          if ((window as any).AdProvider) {
            (window as any).AdProvider.push({"serve": {}});
          }
        }, 100);
      }
    };
  });
</script>

<!-- ExoClick Video Slider Ad Container -->
<ins 
  bind:this={adContainer}
  class="eas6a97888e31" 
  data-zoneid={zoneId}
  data-keywords={keywords}
  data-sub={sub}
  data-block-ad-types={blockAdTypes}
></ins>