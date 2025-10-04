<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';

  // ExoClick S2S Conversion Tracking Configuration
  export let enableConversions: boolean = true;
  export let conversionBaseUrl: string = "http://s.magsrv.com/tag.php";
  export let goalId: string = "ce4c5732ec94917f96fd0cc7e6162ccf"; // From your ExoClick setup

  // Lowered conversion goals (divided by 10)
  const conversionGoals = {
    ad_click: { value: 0.50, description: "User clicked monetized ad" },
    pages_40: { value: 0.40, description: "40+ page views (industry standard)" },
    bookmark: { value: 0.35, description: "Bookmark/favorite action" },
    pages_10: { value: 0.20, description: "10+ page views in session" },
    time_5min: { value: 0.15, description: "5+ minutes on site" },
    search_used: { value: 0.10, description: "Used search functionality" },
    return_visit: { value: 0.075, description: "Returning user" },
    pages_3: { value: 0.05, description: "3+ page views" },
    time_2min: { value: 0.025, description: "2+ minutes on site" }
  };

  // User behavior tracking
  let startTime: number = Date.now();
  let pageViews: number = 0;
  let hasSearched: boolean = false;
  let conversionToken: string | null = null;
  let firedConversions: Set<string> = new Set();

  onMount(() => {
    if (!browser || !enableConversions) return;

    initializeTracking();
    setupEventListeners();
    startTimeTracking();
  });

  function initializeTracking() {
    // Get conversion tracking token from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('conversions_tracking');
    
    if (urlToken) {
      conversionToken = urlToken;
      sessionStorage.setItem('exo_conversion_token', urlToken);
      console.log('🎯 ExoClick conversion token captured:', urlToken);
    } else {
      conversionToken = sessionStorage.getItem('exo_conversion_token');
    }

    // Initialize page view counter
    const storedPageViews = sessionStorage.getItem('page_views');
    pageViews = storedPageViews ? parseInt(storedPageViews) : 0;
    
    // Initialize session start time
    const storedStartTime = sessionStorage.getItem('session_start');
    if (!storedStartTime) {
      sessionStorage.setItem('session_start', startTime.toString());
    } else {
      startTime = parseInt(storedStartTime);
    }

    // Check for returning user
    const lastVisit = localStorage.getItem('last_visit');
    if (lastVisit) {
      fireConversion('return_visit');
    }
    localStorage.setItem('last_visit', Date.now().toString());

    // Track current page view
    incrementPageView();

    // Load previously fired conversions
    const fired = sessionStorage.getItem('fired_conversions');
    if (fired) {
      firedConversions = new Set(JSON.parse(fired));
    }
  }

  function incrementPageView() {
    pageViews++;
    sessionStorage.setItem('page_views', pageViews.toString());
    
    console.log(`📊 Page view #${pageViews} tracked`);
    
    // Fire page view milestone conversions
    if (pageViews === 3 && !firedConversions.has('pages_3')) {
      fireConversion('pages_3');
    }
    if (pageViews === 10 && !firedConversions.has('pages_10')) {
      fireConversion('pages_10');
    }
    if (pageViews === 40 && !firedConversions.has('pages_40')) {
      fireConversion('pages_40');
    }
  }

  function setupEventListeners() {
    // Track ad clicks
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      
      // Check if clicked element is a monetized ad
      if (target.closest('a[href*="ggbetbestoffer.com"]') ||
          target.closest('a[href*="news.susmanga.com"]') ||
          target.closest('a[href*="aads.com"]') ||
          target.closest('[data-ad="true"]') ||
          target.closest('.ad-banner') ||
          target.closest('.sponsored-link')) {
        fireConversion('ad_click');
      }
      
      // Check for bookmark/favorite actions
      if (target.closest('[data-action="bookmark"]') ||
          target.closest('[data-action="favorite"]') ||
          target.closest('.bookmark-btn') ||
          target.closest('.favorite-btn')) {
        fireConversion('bookmark');
      }
    });

    // Track search usage
    document.addEventListener('submit', (e) => {
      const target = e.target as HTMLElement;
      if (target.matches('form[role="search"]') || 
          target.matches('.search-form') ||
          target.closest('.search-banner')) {
        if (!hasSearched && !firedConversions.has('search_used')) {
          hasSearched = true;
          fireConversion('search_used');
        }
      }
    });

    // Track search input usage (alternative method)
    document.addEventListener('input', (e) => {
      const target = e.target as HTMLElement;
      if (target.matches('input[type="search"]') || 
          target.matches('input[name*="search"]') ||
          target.matches('input[placeholder*="search" i]')) {
        if (!hasSearched && !firedConversions.has('search_used')) {
          hasSearched = true;
          setTimeout(() => fireConversion('search_used'), 1000); // Delay to ensure real search
        }
      }
    });
  }

  function startTimeTracking() {
    // 2 minute milestone
    setTimeout(() => {
      if (!firedConversions.has('time_2min')) {
        fireConversion('time_2min');
      }
    }, 2 * 60 * 1000);

    // 5 minute milestone
    setTimeout(() => {
      if (!firedConversions.has('time_5min')) {
        fireConversion('time_5min');
      }
    }, 5 * 60 * 1000);
  }

  async function fireConversion(goalType: keyof typeof conversionGoals) {
    if (!enableConversions || !conversionToken || firedConversions.has(goalType)) {
      return;
    }

    const goal = conversionGoals[goalType];
    if (!goal) return;

    try {
      const params = new URLSearchParams({
        goal: goalId,
        tag: conversionToken,
        value: goal.value.toString()
      });

      const url = `${conversionBaseUrl}?${params}`;
      
      // Use fetch with no-cors mode for ExoClick
      await fetch(url, {
        method: 'GET',
        mode: 'no-cors'
      });

      // Mark conversion as fired
      firedConversions.add(goalType);
      sessionStorage.setItem('fired_conversions', JSON.stringify([...firedConversions]));

      console.log(`✅ Conversion fired: ${goalType} ($${goal.value}) - ${goal.description}`);
      
      // Dispatch custom event for debugging/analytics
      window.dispatchEvent(new CustomEvent('exoclick-conversion', {
        detail: { goalType, value: goal.value, description: goal.description }
      }));
      
    } catch (error) {
      console.error('❌ Conversion tracking failed:', error);
    }
  }

  // Public method to manually fire conversions
  export function manualConversion(goalType: keyof typeof conversionGoals, customValue?: number) {
    if (customValue && conversionGoals[goalType]) {
      const originalValue = conversionGoals[goalType].value;
      conversionGoals[goalType].value = customValue;
      fireConversion(goalType);
      conversionGoals[goalType].value = originalValue; // Restore original
    } else {
      fireConversion(goalType);
    }
  }

  // Public method to get current user metrics
  export function getUserMetrics() {
    const timeOnSite = Date.now() - startTime;
    const totalValue = [...firedConversions].reduce((sum, goalType) => {
      return sum + (conversionGoals[goalType as keyof typeof conversionGoals]?.value || 0);
    }, 0);

    return {
      pageViews,
      timeOnSite: Math.floor(timeOnSite / 1000), // in seconds
      firedConversions: [...firedConversions],
      totalConversionValue: totalValue,
      hasToken: !!conversionToken,
      isHighValue: totalValue >= 0.15 // $0.15+ is considered high value
    };
  }

  // React to page changes
  $: if ($page.url.pathname) {
    incrementPageView();
  }
</script>

<!-- No visible content - this is a behavioral component -->
<div style="display: none;" data-component="exoclick-conversion-tracker">
  <!-- Hidden element for debugging -->
  {#if browser && enableConversions}
    <div data-token={conversionToken ? 'present' : 'missing'} 
         data-page-views={pageViews}
         data-conversions={firedConversions.size}>
    </div>
  {/if}
</div>