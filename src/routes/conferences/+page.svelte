<script lang="ts">
	import { currentUser } from '$lib/stores/auth';
	import { getMemberships, getConferenceById } from '$lib/data';
	import ConferenceListItem from '$lib/components/ConferenceListItem.svelte';

	const memberships = $derived(
		$currentUser ? getMemberships($currentUser.id) : []
	);
</script>

<svelte:head>
	<title>Möten — jskom2</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-4 py-6">
	<h1 class="text-2xl font-bold text-gray-900">Dina möten</h1>
	<p class="mt-1 text-sm text-gray-500">
		{memberships.length} möten, {memberships.reduce((s, m) => s + m.unread, 0)} olästa texter
	</p>

	<div class="mt-6 space-y-2">
		{#each memberships as m}
			{@const conf = getConferenceById(m.conferenceId)}
			{#if conf}
				<ConferenceListItem conference={conf} membership={m} />
			{/if}
		{/each}
	</div>
</div>
