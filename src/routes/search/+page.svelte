<script lang="ts">
	import { texts, conferences, users } from '$lib/data';
	import { getAuthorColor } from '$lib/data';
	import { base } from '$app/paths';
	import StreamMessage from '$lib/components/StreamMessage.svelte';
	import { Search, Globe, Lock, Eye, Users } from 'lucide-svelte';

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

<div class="mx-auto max-w-2xl bg-white">
	<!-- Sticky search header -->
	<div class="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100">
		<div class="px-4 pt-3 pb-2">
			<div class="relative">
				<Search size={16} class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
				<input
					type="text"
					bind:value={query}
					placeholder="Sök texter, möten, personer..."
					class="w-full rounded border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-base text-gray-800 placeholder:text-gray-400 focus:border-lyskom-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-lyskom-400 sm:text-sm"
				/>
			</div>
		</div>

		<!-- Tabs -->
		<div class="flex gap-4 px-4">
			{#each tabs as tab}
				<button
					onclick={() => (activeTab = tab.key)}
					class="border-b-2 pb-1.5 text-xs font-medium transition-colors"
					class:border-lyskom-600={activeTab === tab.key}
					class:text-lyskom-700={activeTab === tab.key}
					class:border-transparent={activeTab !== tab.key}
					class:text-gray-400={activeTab !== tab.key}
					class:hover:text-gray-600={activeTab !== tab.key}
				>
					{tab.label}
					{#if q.length >= 2}
						<span class="ml-0.5 text-gray-400">
							{tab.key === 'texts'
								? matchedTexts.length
								: tab.key === 'conferences'
									? matchedConferences.length
									: matchedUsers.length}
						</span>
					{/if}
				</button>
			{/each}
		</div>
	</div>

	<!-- Results -->
	{#if q.length < 2}
		<p class="px-4 py-8 text-center text-sm text-gray-400">Skriv minst 2 tecken för att söka.</p>
	{:else if activeTab === 'texts'}
		{#each matchedTexts as text}
			<StreamMessage {text} compact />
		{:else}
			<p class="px-4 py-8 text-center text-sm text-gray-400">Inga texter hittades.</p>
		{/each}
	{:else if activeTab === 'conferences'}
		{#each matchedConferences as conf}
			<a
				href="{base}/conferences/{conf.id}"
				class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50/80 transition-colors"
			>
				<span class="text-gray-400">
					{#if conf.type === 'closed'}
						<Lock size={14} />
					{:else if conf.type === 'secret'}
						<Eye size={14} />
					{:else}
						<Globe size={14} />
					{/if}
				</span>
				<span class="min-w-0 flex-1 truncate text-sm font-medium text-gray-700">{conf.name}</span>
				<span class="text-xs text-gray-400">{conf.members} medlemmar</span>
			</a>
		{:else}
			<p class="px-4 py-8 text-center text-sm text-gray-400">Inga möten hittades.</p>
		{/each}
	{:else}
		{#each matchedUsers as user}
			{@const colors = getAuthorColor(user.id)}
			<a
				href="{base}/users/{user.id}"
				class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50/80 transition-colors"
			>
				<div class="shrink-0 w-0.5 h-6 rounded-full {colors.border}"></div>
				<span class="text-sm font-medium {colors.text}">{user.name}</span>
				<span class="text-xs text-gray-400">{user.username}</span>
				<span class="ml-auto text-xs text-gray-400">{user.totalTexts} texter</span>
			</a>
		{:else}
			<p class="px-4 py-8 text-center text-sm text-gray-400">Inga personer hittades.</p>
		{/each}
	{/if}
</div>
