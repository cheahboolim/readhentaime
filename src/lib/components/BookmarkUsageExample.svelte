<!-- src/lib/components/BookmarkUsageExample.svelte -->
<!-- This file shows how to use the bookmark components in your app -->

<script lang="ts">
	import BookmarkButton from './BookmarkButton.svelte'
	import AddToBookmarks from './AddToBookmarks.svelte'
</script>

<div class="p-6 space-y-8">
	<h1 class="text-2xl font-bold mb-6">Bookmark Components Usage</h1>

	<!-- Compact Bookmark Button - Perfect for navigation bars -->
	<section class="space-y-4">
		<h2 class="text-lg font-semibold">Compact Bookmark Button</h2>
		<p class="text-sm text-gray-600 dark:text-gray-400">
			Use this in navigation bars, headers, or anywhere you need a small bookmark button.
		</p>
		<div class="flex gap-4 items-center">
			<BookmarkButton size="small" variant="primary" />
			<BookmarkButton size="medium" variant="secondary" />
			<BookmarkButton size="large" variant="ghost" />
		</div>
	</section>

	<!-- Full Bookmark Component - For dedicated bookmark sections -->
	<section class="space-y-4">
		<h2 class="text-lg font-semibold">Full Bookmark Component</h2>
		<p class="text-sm text-gray-600 dark:text-gray-400">
			Use this when you want to provide comprehensive bookmark functionality with instructions.
		</p>
		<AddToBookmarks />
	</section>

	<!-- Integration Examples -->
	<section class="space-y-4">
		<h2 class="text-lg font-semibold">Integration Examples</h2>

		<div class="grid gap-4">
			<!-- In a share section -->
			<div class="p-4 border rounded-lg">
				<h3 class="font-medium mb-2">Share Section</h3>
				<div class="flex items-center gap-2">
					<span>Share:</span>
					<BookmarkButton size="small" variant="secondary" />
					<!-- Add other share buttons here -->
				</div>
			</div>

			<!-- In a toolbar -->
			<div class="p-4 border rounded-lg">
				<h3 class="font-medium mb-2">Toolbar</h3>
				<div class="flex items-center gap-2">
					<button class="px-3 py-1 border rounded">Like</button>
					<BookmarkButton size="small" variant="ghost" />
					<button class="px-3 py-1 border rounded">Share</button>
				</div>
			</div>

			<!-- In a floating action button area -->
			<div class="p-4 border rounded-lg">
				<h3 class="font-medium mb-2">Floating Actions</h3>
				<div class="flex gap-2">
					<BookmarkButton size="medium" variant="primary" />
					<!-- Other FABs -->
				</div>
			</div>
		</div>
	</section>

	<!-- Code Examples -->
	<section class="space-y-4">
		<h2 class="text-lg font-semibold">Code Examples</h2>

		<div class="space-y-4">
			<div class="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
				<h3 class="font-medium mb-2">Basic Usage</h3>
				<pre class="text-sm"><code>&lt;BookmarkButton size="small" variant="secondary" /&gt;</code></pre>
			</div>

			<div class="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
				<h3 class="font-medium mb-2">Full Component</h3>
				<pre class="text-sm"><code>&lt;AddToBookmarks /&gt;</code></pre>
			</div>

			<div class="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
				<h3 class="font-medium mb-2">Available Props</h3>
				<pre class="text-sm"><code>// BookmarkButton props:
size: 'small' | 'medium' | 'large' = 'medium'
variant: 'primary' | 'secondary' | 'ghost' = 'secondary'

// AddToBookmarks props: (none required)</code></pre>
			</div>
		</div>
	</section>
</div>

<style>
	pre {
		white-space: pre-wrap;
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
	}
</style>