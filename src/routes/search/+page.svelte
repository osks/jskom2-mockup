<script lang="ts">
	import { texts, conferences, users } from '$lib/data';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import TextCard from '$lib/components/TextCard.svelte';
	import ConferenceListItem from '$lib/components/ConferenceListItem.svelte';
	import UserBadge from '$lib/components/UserBadge.svelte';

	let query = $state('');
	let activeTab: 'texts' | 'conferences' | 'users' = $state('texts');

	const q = $derived(query.toLowerCase());

	const matchedTexts = $derived(
		q.length < 2
			? []
			: texts.filter(
					(t) =>
						t.subject.toLowerCase().includes(q) ||
						t.body.toLowerCase().includes(q)
				)
	);

	const matchedConferences = $derived(
		q.length < 2
			? []
			: conferences.filter(
					(c) =>
						c.name.toLowerCase().includes(q) ||
						c.description.toLowerCase().includes(q)
				)
	);

	const matchedUsers = $derived(
		q.length < 2
			? []
			: users.filter(
					(u) =>
						u.name.toLowerCase().includes(q) ||
						u.username.toLowerCase().includes(q)
				)
	);

	const tabs = [
		{ key: 'texts' as const, label: 'Texter' },
		{ key: 'conferences' as const, label: 'Möten' },
		{ key: 'users' as const, label: 'Personer' }
	];
</script>

<svelte:head>
	<title>Sök — jskom2</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-6">
	<h1 class="text-2xl font-bold text-gray-900">Sök</h1>

	<div class="mt-4">
		<SearchBar bind:value={query} />
	</div>

	<!-- Tabs -->
	<div class="mt-4 flex gap-1 border-b border-gray-200">
		{#each tabs as tab}
			<button
				onclick={() => (activeTab = tab.key)}
				class="px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px"
				class:border-lyskom-600={activeTab === tab.key}
				class:text-lyskom-700={activeTab === tab.key}
				class:border-transparent={activeTab !== tab.key}
				class:text-gray-500={activeTab !== tab.key}
				class:hover:text-gray-700={activeTab !== tab.key}
			>
				{tab.label}
				{#if q.length >= 2}
					<span class="ml-1 text-xs text-gray-400">
						({tab.key === 'texts'
							? matchedTexts.length
							: tab.key === 'conferences'
								? matchedConferences.length
								: matchedUsers.length})
					</span>
				{/if}
			</button>
		{/each}
	</div>

	<!-- Results -->
	<div class="mt-4">
		{#if q.length < 2}
			<p class="text-sm text-gray-500">Skriv minst 2 tecken för att söka.</p>
		{:else if activeTab === 'texts'}
			<div class="space-y-2">
				{#each matchedTexts as text}
					<TextCard {text} compact />
				{:else}
					<p class="text-sm text-gray-500">Inga texter hittades.</p>
				{/each}
			</div>
		{:else if activeTab === 'conferences'}
			<div class="space-y-2">
				{#each matchedConferences as conf}
					<ConferenceListItem conference={conf} />
				{:else}
					<p class="text-sm text-gray-500">Inga möten hittades.</p>
				{/each}
			</div>
		{:else}
			<div class="space-y-2">
				{#each matchedUsers as user}
					<a
						href="/users/{user.id}"
						class="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm hover:bg-gray-50 transition-colors"
					>
						<UserBadge userId={user.id} linked={false} />
						<span class="text-sm text-gray-500">({user.username})</span>
						<span class="text-xs text-gray-400 ml-auto">{user.totalTexts} texter</span>
					</a>
				{:else}
					<p class="text-sm text-gray-500">Inga personer hittades.</p>
				{/each}
			</div>
		{/if}
	</div>
</div>
