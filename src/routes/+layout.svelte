<script lang="ts">
	import '../app.css';
	import { currentUser } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import AppShell from '$lib/components/AppShell.svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	const isLoginPage = $derived(page.url.pathname === '/login');

	$effect(() => {
		if (!$currentUser && !isLoginPage) {
			goto('/login');
		}
	});
</script>

{#if isLoginPage || !$currentUser}
	{@render children()}
{:else}
	<AppShell>
		{@render children()}
	</AppShell>
{/if}
