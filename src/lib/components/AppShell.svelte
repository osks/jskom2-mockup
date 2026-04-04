<script lang="ts">
	import NavSidebar from './NavSidebar.svelte';
	import MobileHeader from './MobileHeader.svelte';
	import SidebarDrawer from './SidebarDrawer.svelte';
	import ComposeBar from './ComposeBar.svelte';
	import PersonalMessage from './PersonalMessage.svelte';
	import { personalMessages } from '$lib/stores/messages';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="fixed inset-0 flex overflow-hidden">
	<!-- Desktop sidebar -->
	<div class="hidden w-56 shrink-0 md:block">
		<NavSidebar />
	</div>

	<!-- Main column -->
	<div class="flex min-h-0 min-w-0 flex-1 flex-col">
		<!-- Page content -->
		<main class="flex min-h-0 flex-1 flex-col bg-white">
			{@render children()}
		</main>

		<!-- Global compose bar -->
		<ComposeBar />
	</div>

	<!-- Mobile floating hamburger -->
	<MobileHeader />

	<!-- Mobile sidebar drawer -->
	<SidebarDrawer />

	<!-- Personal message toasts -->
	{#if $personalMessages.length > 0}
		<div class="fixed bottom-4 right-4 z-30 space-y-2">
			{#each $personalMessages as msg, i}
				<PersonalMessage message={msg} index={i} />
			{/each}
		</div>
	{/if}
</div>
