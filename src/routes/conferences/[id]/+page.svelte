<script lang="ts">
	import { page } from '$app/state';
	import { getConferenceById, getTextsInConference, getUserById, memberships } from '$lib/data';
	import { currentUser } from '$lib/stores/auth';
	import { pageTitle } from '$lib/stores/page';
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

	$effect(() => {
		pageTitle.set(conference?.name ?? 'Möte');
	});
</script>

<svelte:head>
	<title>{conference?.name ?? 'Möte'} — jskom2</title>
</svelte:head>

<div class="mx-auto w-full max-w-3xl bg-surface-2 pt-below-header">
	{#if conference}
		<!-- Conference header: full on desktop, description below on mobile -->
		<div class="hidden md:block sticky top-0 z-10 bg-surface-2/95 backdrop-blur-sm border-b border-surface-3 px-4 py-3">
			<div class="text-base font-medium text-txt">{conference.name}</div>
			<p class="mt-0.5 text-xs text-txt-secondary">{conference.description}</p>
			<div class="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-txt-muted">
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

		<!-- Mobile-only: compact info below the header bar -->
		<div class="md:hidden border-b border-surface-3 px-4 py-2">
			<p class="text-xs text-txt-secondary">{conference.description}</p>
			<div class="mt-1 flex flex-wrap items-center gap-3 text-xs text-txt-muted">
				<span>{conference.members} medlemmar</span>
				<span>{conference.totalTexts} texter</span>
			</div>
		</div>

		<!-- Texts -->
		{#each texts as text}
			<StreamMessage {text} compact />
		{:else}
			<p class="px-4 py-8 text-center text-sm text-txt-muted">Inga texter i detta möte.</p>
		{/each}
	{:else}
		<p class="px-4 py-8 text-center text-sm text-txt-muted">Mötet hittades inte.</p>
	{/if}
</div>
