<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  let showModal = false;

  onMount(() => {
    if (!browser) return;

    // Check if user has already verified their age
    const hasVerified = localStorage.getItem('age_verified');
    
    if (!hasVerified) {
      // Small delay to ensure page is loaded
      setTimeout(() => {
        showModal = true;
        // Prevent body scrolling when modal is open
        document.body.classList.add('modal-open');
      }, 500);
    }
  });

  function handleEnter() {
    // User confirmed they are 18+
    localStorage.setItem('age_verified', 'true');
    
    // Fire age verification conversion (high-value action)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('age-verification-completed', { 
        detail: { timestamp: Date.now(), userVerified: true } 
      }));
    }
    
    showModal = false;
    // Re-enable body scrolling
    if (typeof document !== 'undefined') {
      document.body.classList.remove('modal-open');
    }
  }

  function handleNo() {
    // User is under 18 - redirect to blueballs.lol
    window.location.href = 'https://blueballs.lol';
  }

  function handleBackdropClick(event: MouseEvent) {
    // Prevent closing modal by clicking backdrop
    // Force user to make a choice
    event.stopPropagation();
  }
</script>

{#if showModal}
  <!-- Modal backdrop -->
  <div
    class="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
    on:click={handleBackdropClick}
    on:keydown={(e) => e.key === 'Escape' && handleBackdropClick()}
    role="dialog"
    aria-modal="true"
    aria-labelledby="age-verification-title"
    tabindex="-1"
    aria-label="Click to close age verification modal"
  >
    <!-- Modal content -->
    <div
      class="bg-slate-800 rounded-lg p-8 max-w-md w-full mx-auto text-center shadow-2xl border border-slate-600"
      on:click|stopPropagation
      on:keydown|stopPropagation
      role="document"
      aria-label="Age verification content"
    >
      <!-- Title -->
      <h2 id="age-verification-title" class="text-2xl font-bold text-white mb-6">
        Are you 18 years of age or older?
      </h2>
      
      <!-- Warning text -->
      <p class="text-slate-300 mb-8 leading-relaxed">
        You must be 18 years or older and agree to our Terms of Service to 
        access and use this website. By clicking ENTER below, you certify that 
        you are 18 years or older and that you accept our Terms of Service.
      </p>
      
      <!-- Buttons -->
      <div class="space-y-4">
        <!-- Enter button -->
        <button 
          on:click={handleEnter}
          class="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200 text-lg"
          aria-label="I am 18 years or older - Enter website"
        >
          Enter
        </button>
        
        <!-- No button -->
        <button 
          on:click={handleNo}
          class="w-full bg-transparent hover:bg-slate-700 text-slate-300 hover:text-white font-medium py-3 px-6 rounded-lg border border-slate-600 hover:border-slate-500 transition-all duration-200"
          aria-label="I am under 18 years old - Leave website"
        >
          No
        </button>
      </div>
      
      <!-- Footer disclaimer -->
      <p class="text-xs text-slate-500 mt-6">
        This website contains adult content. By entering, you confirm you are of legal age in your jurisdiction.
      </p>
    </div>
  </div>
{/if}

<style>
  /* Ensure modal is above everything */
  :global(body.modal-open) {
    overflow: hidden;
  }
</style>