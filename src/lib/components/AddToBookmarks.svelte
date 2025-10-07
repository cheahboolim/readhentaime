<!-- src/lib/components/AddToBookmarks.svelte -->
<script lang="ts">
	import { onMount } from 'svelte'
	import { trackEvent } from '$lib/gtm'

	let os = 'your device'
	let browser = 'your browser'
	let showInstructions = false
	let canAutoBookmark = false

	// Detect user OS and browser
	function detectOS(): string {
		const ua = navigator.userAgent || navigator.vendor
		if (/android/i.test(ua)) return 'Android'
		if (/iPad|iPhone|iPod/.test(ua)) return 'iOS'
		if (/Windows/.test(ua)) return 'Windows'
		if (/Mac/.test(ua)) return 'Mac'
		if (/Linux/.test(ua)) return 'Linux'
		return 'your device'
	}

	function detectBrowser(): string {
		const ua = navigator.userAgent
		if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome'
		if (ua.includes('Firefox')) return 'Firefox'
		if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari'
		if (ua.includes('Edg')) return 'Edge'
		if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera'
		return 'your browser'
	}

	// Check if automatic bookmarking is supported
	function checkAutoBookmarkSupport(): boolean {
		// Firefox supports sidebar bookmarks
		if (browser === 'Firefox') return true
		// Some browsers support external.AddFavorite (legacy)
		if (typeof window !== 'undefined' && 'external' in window && 'AddFavorite' in (window as any).external) return true
		return false
	}

	// Attempt automatic bookmarking
	function addToBookmarks() {
		trackEvent('bookmark_attempt', {
			category: 'Engagement',
			label: `${browser} on ${os}`
		})

		const title = 'Read Hentai - Premium Adult Manga'
		const url = window.location.href

		try {
			// Method 1: Firefox sidebar
			if (browser === 'Firefox') {
				window.sidebar.addPanel(title, url, '')
				trackEvent('bookmark_success', {
					category: 'Engagement',
					label: 'Firefox Sidebar'
				})
				return
			}

			// Method 2: Legacy IE method (some browsers still support)
			if (typeof window !== 'undefined' && 'external' in window && 'AddFavorite' in (window as any).external) {
				;(window as any).external.AddFavorite(url, title)
				trackEvent('bookmark_success', {
					category: 'Engagement',
					label: 'Legacy Method'
				})
				return
			}

			// Method 3: Show instructions for manual bookmarking
			showInstructions = true
			trackEvent('bookmark_instructions_shown', {
				category: 'Engagement',
				label: `${browser} on ${os}`
			})

		} catch (error) {
			console.log('Auto bookmark failed, showing instructions')
			showInstructions = true
			trackEvent('bookmark_fallback', {
				category: 'Engagement',
				label: 'Manual Instructions'
			})
		}
	}

	// Get browser-specific bookmark instructions
	function getBookmarkInstructions(): string {
		switch (browser) {
			case 'Chrome':
			case 'Edge':
				return os === 'Android'
					? 'Tap ⋮ → "Add to Home Screen"'
					: 'Click ⭐ in address bar or press Ctrl+D'
			case 'Firefox':
				return os === 'Android'
					? 'Tap ⋮ → "Add to Home Screen"'
					: 'Click ☰ → "Bookmark This Page" or press Ctrl+D'
			case 'Safari':
				return os === 'iOS'
					? 'Tap Share 📤 → "Add to Home Screen"'
					: 'Click Share 📤 → "Add Bookmark"'
			default:
				return 'Press Ctrl+D (Cmd+D on Mac) to bookmark'
		}
	}

	onMount(() => {
		os = detectOS()
		browser = detectBrowser()
		canAutoBookmark = checkAutoBookmarkSupport()

		console.log('Bookmark component loaded:', { os, browser, canAutoBookmark })
	})
</script>

<!-- Bookmark Component -->
<div class="bookmark-component">
	<button
		on:click={addToBookmarks}
		class="bookmark-btn"
		aria-label="Add Read Hentai to bookmarks"
	>
		⭐ Add to Bookmarks
	</button>

	{#if showInstructions}
		<div class="instructions-popup">
			<div class="instructions-content">
				<h3>📖 How to Bookmark Read Hentai</h3>
				<p class="instructions-text">{getBookmarkInstructions()}</p>
				<button
					on:click={() => showInstructions = false}
					class="close-btn"
					aria-label="Close instructions"
				>
					✕
				</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.bookmark-component {
		display: inline-block;
		position: relative;
	}

	.bookmark-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		font-size: 0.9rem;
		font-weight: 600;
		border-radius: 8px;
		color: white;
		background: linear-gradient(90deg, #4f46e5, #7c3aed);
		box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
		transition: all 0.2s ease-in-out;
		border: none;
		cursor: pointer;
	}

	.bookmark-btn:hover {
		opacity: 0.9;
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
	}

	.bookmark-btn:active {
		transform: translateY(0);
	}

	.instructions-popup {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10000;
		backdrop-filter: blur(4px);
	}

	.instructions-content {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		max-width: 400px;
		width: 90%;
		position: relative;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
	}

	.instructions-content h3 {
		color: #1f2937;
		margin: 0 0 1rem 0;
		font-size: 1.25rem;
		font-weight: 700;
	}

	.instructions-text {
		color: #4b5563;
		margin: 0;
		line-height: 1.6;
		font-size: 1rem;
		background: #f3f4f6;
		padding: 1rem;
		border-radius: 8px;
		border-left: 4px solid #4f46e5;
	}

	.close-btn {
		position: absolute;
		top: 1rem;
		right: 1rem;
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		color: #6b7280;
		padding: 0.25rem;
		border-radius: 50%;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
	}

	.close-btn:hover {
		background: #f3f4f6;
		color: #1f2937;
	}

	/* Dark mode support */
	@media (prefers-color-scheme: dark) {
		.instructions-content {
			background: #1f2937;
		}

		.instructions-content h3 {
			color: #f9fafb;
		}

		.instructions-text {
			color: #d1d5db;
			background: #374151;
		}

		.close-btn:hover {
			background: #374151;
			color: #f9fafb;
		}
	}

	/* Mobile responsive */
	@media (max-width: 480px) {
		.bookmark-btn {
			padding: 0.75rem 1.25rem;
			font-size: 1rem;
		}

		.instructions-content {
			padding: 1.5rem;
			margin: 1rem;
		}
	}
</style>