<script lang="ts">
	import { toggleSidebar } from '$lib/stores/ui';
	import { Menu } from 'lucide-svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="fixed top-0 left-0 right-0 z-20 flex h-14 items-center gap-3 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 md:hidden">
	<button
		onclick={toggleSidebar}
		class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 active:bg-gray-100"
	>
		<Menu size={20} />
	</button>
	{#if children}
		<div class="min-w-0 flex-1">
			{@render children()}
		</div>
	{/if}
</div>
