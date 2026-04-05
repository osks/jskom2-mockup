<script lang="ts">
	import { toggleSidebar } from '$lib/stores/ui';
	import { pageTitle } from '$lib/stores/page';
	import { Menu, RotateCw } from 'lucide-svelte';

	function refresh() {
		location.reload();
	}
</script>

<div class="safe-top fixed top-0 left-0 right-0 z-20 flex h-14 items-center gap-3 bg-gray-50/95 backdrop-blur-sm border-b border-gray-200 px-4 md:hidden">
	<button
		onclick={toggleSidebar}
		class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 active:bg-gray-100"
	>
		<Menu size={20} />
	</button>
	{#if $pageTitle}
		<span class="min-w-0 flex-1 truncate text-sm font-medium text-gray-500">{$pageTitle}</span>
	{/if}
	<button
		onclick={refresh}
		class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 active:bg-gray-100"
	>
		<RotateCw size={16} />
	</button>
</div>
