<script lang="ts">
	import { sidebarOpen, closeSidebar } from '$lib/stores/ui';
	import NavSidebar from './NavSidebar.svelte';

	function handleBackdropClick() {
		closeSidebar();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') closeSidebar();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if $sidebarOpen}
	<!-- Backdrop -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-40 bg-black/50 md:hidden"
		onclick={handleBackdropClick}
	></div>

	<!-- Drawer -->
	<div class="fixed inset-y-0 left-0 z-50 w-72 md:hidden">
		<NavSidebar onNavigate={closeSidebar} />
	</div>
{/if}
