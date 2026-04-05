<script lang="ts">
	import { toggleSidebar } from '$lib/stores/ui';
	import { pageTitle, pageSubtitle } from '$lib/stores/page';
	import { Menu, RotateCw } from 'lucide-svelte';

	function refresh() {
		location.reload();
	}
</script>

<div class="fixed top-0 left-0 right-0 z-20 md:hidden">
	<div class="safe-top bg-gray-50/55 backdrop-blur-md"></div>
	<div class="flex h-14 items-center gap-2.5 bg-gray-50/55 backdrop-blur-md px-4">
		<!-- Hamburger -->
		<button
			onclick={toggleSidebar}
			class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-200/55 ring-1 ring-white shadow-[0_0_0_0.5px_rgba(0,0,0,0.06)] text-gray-500 active:bg-gray-300/50"
		>
			<Menu size={20} />
		</button>

		<!-- Center: meeting name + unread count -->
		<div class="flex min-w-0 flex-1 flex-col items-center justify-center rounded-full bg-gray-200/55 ring-1 ring-white shadow-[0_0_0_0.5px_rgba(0,0,0,0.06)] h-12 px-4">
			{#if $pageTitle}
				<span class="max-w-full truncate text-sm font-medium text-gray-700">{$pageTitle}</span>
			{/if}
			{#if $pageSubtitle}
				<span class="max-w-full truncate text-[11px] text-gray-400 -mt-0.5">{$pageSubtitle}</span>
			{/if}
		</div>

		<!-- Refresh -->
		<button
			onclick={refresh}
			class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-200/55 ring-1 ring-white shadow-[0_0_0_0.5px_rgba(0,0,0,0.06)] text-gray-400 active:bg-gray-300/50"
		>
			<RotateCw size={16} />
		</button>
	</div>
</div>
