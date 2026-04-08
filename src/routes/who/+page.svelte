<script lang="ts">
	import { sessions } from '$lib/data';
	import { currentUser } from '$lib/stores/auth';
	import { pageTitle } from '$lib/stores/page';
	import SessionRow from '$lib/components/SessionRow.svelte';

	$effect(() => {
		pageTitle.set(`${sessions.length} ${sessions.length === 1 ? 'session' : 'sessioner'} aktiva`);
	});
</script>

<svelte:head>
	<title>Vilka — jskom2</title>
</svelte:head>

<div class="mx-auto max-w-2xl bg-surface-2 pt-below-header">
	<!-- Header: desktop only (mobile uses MobileHeader bar) -->
	<div class="hidden md:block sticky top-0 z-10 bg-surface-2/95 backdrop-blur-sm border-b border-surface-3 px-4 py-2">
		<span class="text-xs font-medium text-txt-secondary">
			{sessions.length} {sessions.length === 1 ? 'session' : 'sessioner'} aktiva
		</span>
	</div>

	{#each sessions as session}
		<SessionRow
			{session}
			isCurrentUser={$currentUser?.id === session.userId}
		/>
	{/each}
</div>
