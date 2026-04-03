<script lang="ts">
	import { page } from '$app/state';
	import { getConferenceById, getTextsInConference, getUserById, memberships } from '$lib/data';
	import { currentUser } from '$lib/stores/auth';
	import TextCard from '$lib/components/TextCard.svelte';
	import UserBadge from '$lib/components/UserBadge.svelte';
	import { Lock, Globe, Users } from 'lucide-svelte';

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

<div class="mx-auto max-w-3xl px-4 py-6">
	{#if conference}
		<!-- Conference info card -->
		<div class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
			<div class="flex items-start gap-3">
				<div class="mt-0.5 text-gray-400">
					{#if conference.type === 'closed'}
						<Lock size={20} />
					{:else}
						<Globe size={20} />
					{/if}
				</div>
				<div>
					<h1 class="text-2xl font-bold text-gray-900">{conference.name}</h1>
					<p class="mt-1 text-sm text-gray-600">{conference.description}</p>
					<div class="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
						<span class="flex items-center gap-1">
							<Users size={14} />
							{conference.members} medlemmar
						</span>
						<span>{conference.totalTexts} texter</span>
						{#if creator}
							<span>Skapad av <UserBadge userId={conference.creator} showAvatar={false} /></span>
						{/if}
						{#if membership}
							<span>Prioritet: {membership.priority}</span>
						{/if}
					</div>
				</div>
			</div>
		</div>

		<!-- Recent texts -->
		<h2 class="mt-8 mb-4 text-lg font-semibold text-gray-900">Senaste texter</h2>
		<div class="space-y-3">
			{#each texts as text}
				<TextCard {text} compact />
			{/each}
			{#if texts.length === 0}
				<p class="text-sm text-gray-500">Inga texter i detta möte.</p>
			{/if}
		</div>
	{:else}
		<p class="text-gray-500">Mötet hittades inte.</p>
	{/if}
</div>
