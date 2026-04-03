<script lang="ts">
	import NavSidebar from './NavSidebar.svelte';
	import MobileNav from './MobileNav.svelte';
	import PersonalMessage from './PersonalMessage.svelte';
	import { personalMessages } from '$lib/stores/messages';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="flex h-screen">
	<!-- Desktop sidebar -->
	<div class="hidden md:block">
		<NavSidebar />
	</div>

	<!-- Main content -->
	<main class="flex-1 overflow-y-auto pb-16 md:pb-0">
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
