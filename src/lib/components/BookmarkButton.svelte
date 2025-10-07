<!-- src/lib/components/BookmarkButton.svelte -->
<script lang="ts">
	import { trackEvent } from '$lib/gtm'

	export let size: 'small' | 'medium' | 'large' = 'medium'
	export let variant: 'primary' | 'secondary' | 'ghost' = 'secondary'

	let showTooltip = false

	// Detect user OS and browser for instructions
	function detectOS(): string {
		const ua = navigator.userAgent || navigator.vendor
		if (/android/i.test(ua)) return 'Android'
		if (/iPad|iPhone|iPod/.test(ua)) return 'iOS'
		if (/Windows/.test(ua)) return 'Windows'
		if (/Mac/.test(ua)) return 'Mac'
		return 'desktop'
	}

	function detectBrowser(): string {
		const ua = navigator.userAgent
		if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome'
		if (ua.includes('Firefox')) return 'Firefox'
		if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari'
		if (ua.includes('Edg')) return 'Edge'
		return 'other'
	}

	function handleBookmark() {
		const os = detectOS()
		const browser = detectBrowser()

		trackEvent('bookmark_click', {
			category: 'Engagement',
			label: `${browser} on ${os}`
		})

		const title = 'Read Hentai - Premium Adult Manga'
		const url = window.location.href

		try {
			// Firefox sidebar bookmarking
			if (browser === 'Firefox' && window.sidebar) {
				window.sidebar.addPanel(title, url, '')
				showSuccessTooltip()
				return
			}

			// Legacy bookmark method (some browsers)
			if (typeof window !== 'undefined' && 'external' in window && 'AddFavorite' in (window as any).external) {
				;(window as any).external.AddFavorite(url, title)
				showSuccessTooltip()
				return
			}

			// Show keyboard shortcut tooltip
			showKeyboardTooltip()

		} catch (error) {
			showKeyboardTooltip()
		}
	}

	function showSuccessTooltip() {
		showTooltip = true
		setTimeout(() => showTooltip = false, 2000)
		trackEvent('bookmark_success', {
			category: 'Engagement',
			label: 'Auto Bookmark'
		})
	}

	function showKeyboardTooltip() {
		showTooltip = true
		setTimeout(() => showTooltip = false, 3000)
		trackEvent('bookmark_instructions', {
			category: 'Engagement',
			label: 'Keyboard Shortcut Shown'
		})
	}
</script>

<!-- Compact Bookmark Button -->
<div class="bookmark-container">
	<button
		on:click={handleBookmark}
		class="bookmark-btn {size} {variant}"
		aria-label="Bookmark this page"
	>
		⭐
	</button>

	{#if showTooltip}
		<div class="tooltip">
			{#if detectBrowser() === 'Firefox' && window.sidebar}
				✅ Added to bookmarks!
			{:else}
				Press <kbd>Ctrl+D</kbd> (Cmd+D on Mac) to bookmark
			{/if}
		</div>
	{/if}
</div>

<style>
	.bookmark-container {
		position: relative;
		display: inline-block;
	}

	.bookmark-btn {
		border: none;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.2em;
	}

	/* Size variants */
	.bookmark-btn.small {
		width: 2rem;
		height: 2rem;
		font-size: 1em;
	}

	.bookmark-btn.medium {
		width: 2.5rem;
		height: 2.5rem;
		font-size: 1.1em;
	}

	.bookmark-btn.large {
		width: 3rem;
		height: 3rem;
		font-size: 1.2em;
	}

	/* Style variants */
	.bookmark-btn.primary {
		background: linear-gradient(90deg, #4f46e5, #7c3aed);
		color: white;
		box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
	}

	.bookmark-btn.primary:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
		opacity: 0.9;
	}

	.bookmark-btn.secondary {
		background: rgba(255, 255, 255, 0.1);
		color: #fbbf24;
		border: 1px solid rgba(251, 191, 36, 0.3);
		backdrop-filter: blur(4px);
	}

	.bookmark-btn.secondary:hover {
		background: rgba(251, 191, 36, 0.1);
		border-color: rgba(251, 191, 36, 0.5);
		transform: translateY(-1px);
	}

	.bookmark-btn.ghost {
		background: transparent;
		color: #fbbf24;
		border: 1px solid transparent;
	}

	.bookmark-btn.ghost:hover {
		background: rgba(251, 191, 36, 0.1);
		border-color: rgba(251, 191, 36, 0.3);
	}

	.tooltip {
		position: absolute;
		bottom: 100%;
		left: 50%;
		transform: translateX(-50%);
		background: rgba(0, 0, 0, 0.9);
		color: white;
		padding: 0.5rem 0.75rem;
		border-radius: 6px;
		font-size: 0.85rem;
		white-space: nowrap;
		z-index: 1000;
		margin-bottom: 0.5rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		backdrop-filter: blur(8px);
	}

	.tooltip kbd {
		background: rgba(255, 255, 255, 0.1);
		padding: 0.1rem 0.3rem;
		border-radius: 3px;
		font-family: monospace;
		font-size: 0.8em;
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.tooltip::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		border: 5px solid transparent;
		border-top-color: rgba(0, 0, 0, 0.9);
	}

	/* Mobile adjustments */
	@media (max-width: 768px) {
		.tooltip {
			font-size: 0.8rem;
			padding: 0.4rem 0.6rem;
		}
	}
</style>