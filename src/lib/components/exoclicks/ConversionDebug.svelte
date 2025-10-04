<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  let conversionData: any = {};
  let debugMode = false;

  onMount(() => {
    if (!browser) return;

    // Check for debug mode in URL
    const urlParams = new URLSearchParams(window.location.search);
    debugMode = urlParams.has('debug_conversions');

    if (debugMode) {
      console.log('🔍 ExoClick Conversion Debug Mode Active');
      
      // Listen for conversion events
      window.addEventListener('exoclick-conversion', (e: any) => {
        console.log('🎯 Conversion Event:', e.detail);
        updateDebugDisplay();
      });

      // Listen for search events
      window.addEventListener('search-performed', (e: any) => {
        console.log('🔍 Search Event:', e.detail);
      });

      // Update display every 5 seconds
      setInterval(updateDebugDisplay, 5000);
      updateDebugDisplay();
    }
  });

  function updateDebugDisplay() {
    if (!browser) return;

    const token = sessionStorage.getItem('exo_conversion_token');
    const pageViews = sessionStorage.getItem('page_views');
    const sessionStart = sessionStorage.getItem('session_start');
    const firedConversions = sessionStorage.getItem('fired_conversions');
    const lastVisit = localStorage.getItem('last_visit');

    const timeOnSite = sessionStart ? 
      Math.floor((Date.now() - parseInt(sessionStart)) / 1000) : 0;

    conversionData = {
      hasToken: !!token,
      token: token ? `${token.substring(0, 8)}...` : 'None',
      pageViews: parseInt(pageViews || '0'),
      timeOnSite: `${Math.floor(timeOnSite / 60)}m ${timeOnSite % 60}s`,
      firedConversions: firedConversions ? JSON.parse(firedConversions) : [],
      isReturningUser: !!lastVisit,
      url: window.location.href
    };
  }

  function simulateConversion(type: string) {
    const event = new CustomEvent('exoclick-conversion', {
      detail: { goalType: type, value: 0.1, description: `Simulated ${type}` }
    });
    window.dispatchEvent(event);
  }

  function clearData() {
    if (confirm('Clear all conversion tracking data?')) {
      sessionStorage.removeItem('exo_conversion_token');
      sessionStorage.removeItem('page_views');
      sessionStorage.removeItem('session_start');
      sessionStorage.removeItem('fired_conversions');
      localStorage.removeItem('last_visit');
      updateDebugDisplay();
    }
  }
</script>

{#if debugMode}
  <div class="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg shadow-lg max-w-sm text-xs z-50">
    <div class="flex justify-between items-center mb-2">
      <h3 class="font-bold text-sm">🎯 ExoClick Debug</h3>
      <button 
        on:click={() => debugMode = false}
        class="text-red-400 hover:text-red-300 text-lg leading-none"
        title="Close debug panel"
      >×</button>
    </div>
    
    <div class="space-y-1 mb-3">
      <div class="flex justify-between">
        <span>Token:</span>
        <span class="text-{conversionData.hasToken ? 'green' : 'red'}-400">
          {conversionData.token || 'Missing'}
        </span>
      </div>
      
      <div class="flex justify-between">
        <span>Page Views:</span>
        <span class="text-blue-400">{conversionData.pageViews}</span>
      </div>
      
      <div class="flex justify-between">
        <span>Time on Site:</span>
        <span class="text-yellow-400">{conversionData.timeOnSite}</span>
      </div>
      
      <div class="flex justify-between">
        <span>Returning:</span>
        <span class="text-{conversionData.isReturningUser ? 'green' : 'gray'}-400">
          {conversionData.isReturningUser ? 'Yes' : 'No'}
        </span>
      </div>
    </div>

    <div class="mb-3">
      <div class="text-xs text-gray-400 mb-1">Fired Conversions:</div>
      {#if conversionData.firedConversions?.length > 0}
        <div class="flex flex-wrap gap-1">
          {#each conversionData.firedConversions as conversion}
            <span class="bg-green-600 px-1 py-0.5 rounded text-xs">{conversion}</span>
          {/each}
        </div>
      {:else}
        <span class="text-gray-500 text-xs">None yet</span>
      {/if}
    </div>

    <div class="space-y-1">
      <button 
        on:click={() => simulateConversion('ad_click')}
        class="w-full bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded text-xs"
      >
        Simulate Ad Click ($0.50)
      </button>
      
      <button 
        on:click={() => simulateConversion('search_used')}
        class="w-full bg-green-600 hover:bg-green-500 px-2 py-1 rounded text-xs"
      >
        Simulate Search ($0.10)
      </button>
      
      <button 
        on:click={clearData}
        class="w-full bg-red-600 hover:bg-red-500 px-2 py-1 rounded text-xs"
      >
        Clear All Data
      </button>
    </div>
  </div>
{/if}

<!-- Add debug mode toggle button if not active -->
{#if !debugMode && browser}
  <button 
    on:click={() => debugMode = true}
    class="fixed bottom-4 right-4 bg-orange-600 hover:bg-orange-500 text-white p-2 rounded-full shadow-lg z-40 text-xs"
    title="Enable conversion debug mode"
  >
    🎯
  </button>
{/if}