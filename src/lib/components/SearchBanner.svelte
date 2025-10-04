<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { Search, Clock, X } from 'lucide-svelte';

  let searchValue = '';
  let recentSearches: string[] = [];
  let searchInput: HTMLInputElement;

  // Load recent searches from localStorage
  onMount(() => {
    const saved = localStorage.getItem('susmanga-recent-searches');
    if (saved) {
      recentSearches = JSON.parse(saved).slice(0, 5); // Limit to 5 recent searches
    }
  });

  function handleSearch(event?: Event) {
    if (event) event.preventDefault();
    
    const query = searchValue.trim();
    if (!query) return;

    // Save to recent searches
    saveRecentSearch(query);
    
    // Navigate to search results
    goto(`/search?q=${encodeURIComponent(query)}`);
    
    // Clear the input
    searchValue = '';
    
    // Fire search conversion (will be picked up by ConversionTracker)
    window.dispatchEvent(new CustomEvent('search-performed', { 
      detail: { query, timestamp: Date.now() } 
    }));
  }

  function saveRecentSearch(query: string) {
    // Remove if already exists and add to beginning
    recentSearches = [query, ...recentSearches.filter(search => search !== query)].slice(0, 5);
    localStorage.setItem('susmanga-recent-searches', JSON.stringify(recentSearches));
  }

  function selectRecentSearch(search: string) {
    searchValue = search;
    handleSearch();
  }

  function removeRecentSearch(search: string, event: Event) {
    event.stopPropagation();
    recentSearches = recentSearches.filter(s => s !== search);
    localStorage.setItem('susmanga-recent-searches', JSON.stringify(recentSearches));
  }

  function clearAllSearches() {
    recentSearches = [];
    localStorage.removeItem('susmanga-recent-searches');
  }
</script>

<div class="search-banner-container relative w-full max-w-4xl mx-auto mb-6 md:mb-8 px-4 sm:px-6 lg:px-8">
  <!-- Main Search Banner -->
  <div class="bg-gradient-to-r from-black via-gray-900 to-black border border-gray-800 rounded-2xl p-4 md:p-8 shadow-xl">
    <div class="text-center mb-4 md:mb-6">
      <h1 class="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
        Search The <span class="text-pink-500">Best Hentai Collections</span>
        <br class="hidden sm:block" />
        <span class="block mt-1 text-xl md:text-2xl lg:text-3xl text-pink-400">on READHENTAI.ME</span>
      </h1>
      <p class="text-gray-300 text-sm md:text-lg">
        Search Hentai Characters, Titles, Tags, Series and Many More
      </p>
    </div>

    <!-- Search Form -->
    <form on:submit={handleSearch} class="relative">
      <div class="relative">
        <input
          bind:this={searchInput}
          bind:value={searchValue}
          type="text"
          placeholder="Enter manga title, character name, artist..."
          class="w-full px-4 md:px-6 py-3 md:py-4 pl-12 md:pl-14 pr-16 md:pr-20 text-sm md:text-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-400 rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-pink-500/30 focus:border-pink-500 transition-all duration-300 font-medium"
        />
        
        <!-- Search Icon -->
        <div class="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2">
          <Search class="w-5 h-5 md:w-6 md:h-6 text-gray-400" />
        </div>
        
        <!-- Search Button -->
        <button
          type="submit"
          class="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 bg-pink-600 hover:bg-pink-700 text-white px-3 md:px-6 py-1.5 md:py-2 rounded-lg text-sm md:text-base font-semibold transition-colors duration-200 shadow-lg"
        >
          Search
        </button>
      </div>
    </form>

    <!-- Recent Search Chips -->
    {#if recentSearches.length > 0}
      <div class="mt-4 md:mt-6">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold text-gray-300 flex items-center">
            <Clock class="w-4 h-4 mr-2" />
            Recent Searches
          </h3>
          <button
            on:click={clearAllSearches}
            class="text-xs text-gray-400 hover:text-red-400 transition-colors flex items-center"
          >
            <X class="w-3 h-3 mr-1" />
            Clear All
          </button>
        </div>
        
        <div class="flex flex-wrap gap-2">
          {#each recentSearches as search}
            <div class="flex items-center bg-gray-800 hover:bg-gray-700 rounded-full border border-gray-700 transition-colors group">
              <button
                on:click={() => selectRecentSearch(search)}
                class="flex items-center px-3 py-1.5 text-sm text-gray-300 hover:text-white transition-colors rounded-l-full"
              >
                <Search class="w-3 h-3 mr-2 text-gray-400" />
                <span class="max-w-[150px] md:max-w-[200px] truncate">{search}</span>
              </button>
              <button
                on:click={(e) => removeRecentSearch(search, e)}
                class="px-2 py-1.5 text-gray-400 hover:text-red-400 transition-colors rounded-r-full border-l border-gray-700 group-hover:border-gray-600"
                title="Remove search"
              >
                <X class="w-3 h-3" />
              </button>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>