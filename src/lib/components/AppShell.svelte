<script lang="ts">
	import NavSidebar from './NavSidebar.svelte';
	import MobileHeader from './MobileHeader.svelte';
	import ComposeBar from './ComposeBar.svelte';
	import PersonalMessage from './PersonalMessage.svelte';
	import { sidebarOpen, closeSidebar } from '$lib/stores/ui';
	import { personalMessages } from '$lib/stores/messages';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	function handleContentClick() {
		if ($sidebarOpen) {
			closeSidebar();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && $sidebarOpen) closeSidebar();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="h-dvh w-full">
	<!-- Mobile nav: always rendered, sits behind content -->
	<div class="fixed inset-0 z-0 w-72 bg-gray-50 md:hidden">
		<NavSidebar onNavigate={closeSidebar} />
	</div>

	<!-- Desktop sidebar + main content wrapper -->
	<div
		class="relative z-10 flex h-full bg-gray-50 overflow-clip transition-transform duration-250 ease-out"
		class:translate-x-72={$sidebarOpen}
		class:md:!translate-x-0={true}
		class:shadow-[-4px_0_12px_rgba(0,0,0,0.08)]={$sidebarOpen}
	>
		<!-- Desktop sidebar -->
		<div class="hidden w-56 shrink-0 md:block">
			<NavSidebar />
		</div>

		<!-- Main column -->
		<div class="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-none">
			<!-- Page content -->
			<main class="flex min-h-0 flex-1 flex-col">
				{@render children()}
			</main>

			<!-- Global compose bar -->
			<ComposeBar />
		</div>

		<!-- Tap-to-close overlay when sidebar is open -->
		{#if $sidebarOpen}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="fixed inset-0 z-30 md:hidden"
				onclick={handleContentClick}
			></div>
		{/if}

	</div>

	<!-- Mobile header bar (outside wrapper so backdrop-filter can see through to content) -->
	<div
		class="fixed top-0 left-0 right-0 z-20 md:hidden transition-transform duration-250 ease-out"
		class:translate-x-72={$sidebarOpen}
	>
		<MobileHeader />
	</div>

	<!-- Personal message toasts -->
	{#if $personalMessages.length > 0}
		<div class="fixed bottom-4 right-4 z-30 space-y-2">
			{#each $personalMessages as msg, i}
				<PersonalMessage message={msg} index={i} />
			{/each}
		</div>
	{/if}
</div>
