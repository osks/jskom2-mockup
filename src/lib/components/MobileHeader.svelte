<script lang="ts">
	import { toggleSidebar } from '$lib/stores/ui';
	import { pageTitle, pageSubtitle } from '$lib/stores/page';
	import { Menu, RotateCw } from 'lucide-svelte';

	function refresh() {
		location.reload();
	}
</script>

<div class="fixed top-0 left-0 right-0 z-20 md:hidden">
	<!-- Main header area with translucent bg + blur -->
	<div class="bg-gray-50/80" style="backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);">
		<div class="safe-top"></div>
		<div class="flex h-14 items-center gap-2.5 px-4">
			<!-- Hamburger -->
			<button
				onclick={toggleSidebar}
				class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-200/70 ring-[1.5px] ring-white/80 shadow-[0_0_0_0.5px_rgba(0,0,0,0.06)] text-gray-800 active:bg-gray-300/50"
			>
				<Menu size={20} />
			</button>

			<!-- Center: meeting name + unread count -->
			<div class="flex min-w-0 flex-1 flex-col items-center justify-center">
				{#if $pageTitle}
					<span class="max-w-full truncate text-sm font-medium text-gray-800">{$pageTitle}</span>
				{/if}
				{#if $pageSubtitle}
					<span class="max-w-full truncate text-[11px] text-gray-600 -mt-0.5">{$pageSubtitle}</span>
				{/if}
			</div>

			<!-- Refresh -->
			<button
				onclick={refresh}
				class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-200/70 ring-[1.5px] ring-white/80 shadow-[0_0_0_0.5px_rgba(0,0,0,0.06)] text-gray-800 active:bg-gray-300/50"
			>
				<RotateCw size={16} />
			</button>
		</div>
	</div>
	<!-- Soft fade below the header -->
	<div class="h-3 bg-gradient-to-b from-gray-50/60 to-transparent pointer-events-none"></div>
</div>
