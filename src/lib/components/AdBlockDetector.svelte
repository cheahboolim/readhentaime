<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  let adBlockDetected = false;
  let showAdBlockMessage = false;
  let isDismissed = false;

  onMount(() => {
    if (!browser) return;

    // Check if user has already dismissed the message recently
    const dismissed = localStorage.getItem('adblock_dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    if (dismissedTime > oneDayAgo) {
      isDismissed = true;
      return;
    }

    // Run ad block detection after page loads
    setTimeout(detectAdBlock, 2000);
  });

  function detectAdBlock() {
    // Method 1: Try to create a fake ad element
    const adTest = document.createElement('div');
    adTest.innerHTML = '&nbsp;';
    adTest.className = 'adsbox ad ads advertisement';
    adTest.style.cssText = 'position:absolute;top:-1000px;left:-1000px;width:1px;height:1px;';
    
    try {
      document.body.appendChild(adTest);
      
      // Check if the element was hidden or removed by ad blocker
      const isBlocked = adTest.offsetHeight === 0 || 
                       adTest.style.display === 'none' || 
                       adTest.style.visibility === 'hidden';
      
      document.body.removeChild(adTest);
      
      if (isBlocked) {
        adBlockDetected = true;
        checkAdProviders();
      }
    } catch (e) {
      adBlockDetected = true;
      checkAdProviders();
    }
  }

  function checkAdProviders() {
    // Method 2: Check if our actual ad providers are being blocked
    const adProviders = [
      'a-ads.com',
      'magsrv.com',
      'pemsrv.com'
    ];

    let blockedCount = 0;
    
    adProviders.forEach(provider => {
      const img = new Image();
      img.onload = () => {
        // Provider accessible
      };
      img.onerror = () => {
        blockedCount++;
        if (blockedCount >= 2) {
          // Multiple providers blocked - likely ad blocker
          adBlockDetected = true;
          showMessage();
        }
      };
      img.src = `https://${provider}/favicon.ico?t=${Date.now()}`;
    });

    // Fallback - show message if first test detected blocking
    if (adBlockDetected) {
      setTimeout(showMessage, 1000);
    }
  }

  function showMessage() {
    if (!isDismissed && adBlockDetected) {
      showAdBlockMessage = true;
    }
  }

  function handleDismiss() {
    showAdBlockMessage = false;
    localStorage.setItem('adblock_dismissed', Date.now().toString());
    
    // Fire conversion for users who engage with the message (shows interest)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('adblock-acknowledged', { 
        detail: { timestamp: Date.now(), userEngaged: true } 
      }));
    }
  }

  function handleWhitelist() {
    // User clicked to learn about whitelisting
    showAdBlockMessage = false;
    localStorage.setItem('adblock_dismissed', Date.now().toString());
    
    // Fire higher-value conversion for users willing to whitelist
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('adblock-whitelist-interest', { 
        detail: { timestamp: Date.now(), userWillWhitelist: true } 
      }));
    }
    
    // Open help guide in new tab
    window.open('https://www.wikihow.com/Disable-Adblock', '_blank', 'noopener,noreferrer');
  }
</script>

{#if showAdBlockMessage}
  <!-- Ad Block Detection Notice -->
  <div class="fixed top-4 right-4 max-w-sm bg-slate-800 border border-orange-500 rounded-lg shadow-2xl z-40 p-5">
    <!-- Header -->
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center">
        <div class="bg-orange-500 rounded-full p-1 mr-3">
          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <h3 class="text-white font-semibold text-sm">AdBlock Detected</h3>
      </div>
      <button 
        on:click={handleDismiss}
        class="text-slate-400 hover:text-white transition-colors"
        aria-label="Dismiss message"
      >
        ✕
      </button>
    </div>

    <!-- Message Content -->
    <div class="text-slate-300 text-sm mb-4 leading-relaxed">
      <p class="mb-2">
        Hey there! 👋 We noticed you're using an ad blocker.
      </p>
      <p class="mb-2">
        Our ads are <strong class="text-orange-400">non-intrusive</strong> and help keep ReadHentai.me free for everyone.
      </p>
      <p class="text-xs text-slate-400">
        No popups, auto-play videos, or malware - just simple banner ads.
      </p>
    </div>

    <!-- Action Buttons -->
    <div class="space-y-2">
      <button 
        on:click={handleWhitelist}
        class="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded transition-colors text-sm"
      >
        📖 How to Whitelist Us
      </button>
      
      <button 
        on:click={handleDismiss}
        class="w-full bg-transparent hover:bg-slate-700 text-slate-300 hover:text-white font-medium py-2 px-4 rounded border border-slate-600 hover:border-slate-500 transition-all text-sm"
      >
        Maybe Later
      </button>
    </div>

    <!-- Small print -->
    <p class="text-xs text-slate-500 mt-3 text-center">
      Your support keeps quality content free! 💙
    </p>
  </div>
{/if}

<style>
  /* Ensure the message appears above everything */
  .fixed {
    z-index: 9999;
  }
  
  /* Smooth slide-in animation */
  .fixed {
    animation: slideInRight 0.5s ease-out;
  }
  
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
</style>