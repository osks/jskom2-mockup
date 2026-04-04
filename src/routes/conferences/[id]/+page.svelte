<script lang="ts">
	import { page } from '$app/state';
	import { getConferenceById, getTextsInConference, getUserById, memberships } from '$lib/data';
	import { currentUser } from '$lib/stores/auth';
	import StreamMessage from '$lib/components/StreamMessage.svelte';
	import { Users } from 'lucide-svelte';

	const confId = $derived(Number(page.params.id));
	const conference = $derived(getConferenceById(confId));
	const texts = $derived(getTextsInConference(confId).reverse());
	const creator = $derived(conference ? getUserById(conference.creator) : null);
	const membership = $derived(
		$currentUser
			? memberships.find((m) => m.userId === $currentUser!.id && m.conferenceId === confId)
			: null
	);
</script>

<svelte:head>
	<title>{conference?.name ?? 'Möte'} — jskom2</title>
</svelte:head>

<div class="mx-auto max-w-2xl bg-white">
	{#if conference}
		<!-- Conference header -->
		<div class="sticky top-14 md:top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3">
			<div class="text-base font-medium text-gray-900">{conference.name}</div>
			<p class="mt-0.5 text-xs text-gray-500">{conference.description}</p>
			<div class="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-gray-400">
				<span class="flex items-center gap-1">
					<Users size={12} />
					{conference.members} medlemmar
				</span>
				<span>{conference.totalTexts} texter</span>
				{#if creator}
					<span>av {creator.name}</span>
				{/if}
				{#if membership}
					<span>Prioritet {membership.priority}</span>
				{/if}
			</div>
		</div>

		<!-- Texts -->
		{#each texts as text}
			<StreamMessage {text} compact />
		{:else}
			<p class="px-4 py-8 text-center text-sm text-gray-400">Inga texter i detta möte.</p>
		{/each}
	{:else}
		<p class="px-4 py-8 text-center text-sm text-gray-400">Mötet hittades inte.</p>
	{/if}
</div>
