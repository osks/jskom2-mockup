<script lang="ts">
	import '../app.css';
	import { currentUser } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import AppShell from '$lib/components/AppShell.svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	const isLoginPage = $derived(page.url.pathname === `${base}/login`);

	$effect(() => {
		if (!$currentUser && !isLoginPage) {
			goto(`${base}/login`);
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
