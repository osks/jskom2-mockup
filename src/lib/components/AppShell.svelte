<script lang="ts">
	import NavSidebar from './NavSidebar.svelte';
	import MobileNav from './MobileNav.svelte';
	import PersonalMessage from './PersonalMessage.svelte';
	import { personalMessages } from '$lib/stores/messages';
	import { page } from '$app/state';
	import { base } from '$app/paths';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	// On the reading page, ComposeBar replaces the mobile nav — no bottom padding needed
	const isReadingPage = $derived(
		page.url.pathname === `${base}/read` || page.url.pathname.startsWith(`${base}/read/`)
	);
</script>

<div class="flex h-screen">
	<!-- Desktop sidebar -->
	<div class="hidden md:block">
		<NavSidebar />
	</div>

	<!-- Main content -->
	<main
		class="flex min-h-0 flex-1 flex-col overflow-y-auto md:pb-0"
		class:pb-16={!isReadingPage}
	>
		{@render children()}
	</main>

	<!-- Mobile nav -->
	<MobileNav />

	<!-- Personal message toasts -->
	{#if $personalMessages.length > 0}
		<div class="fixed bottom-4 right-4 z-30 space-y-2 md:bottom-4">
			{#each $personalMessages as msg, i}
				<PersonalMessage message={msg} index={i} />
			{/each}
		</div>
	{/if}
</div>
