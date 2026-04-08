<script lang="ts">
	import { texts, conferences, users } from '$lib/data';
	import { base } from '$app/paths';
	import { pageTitle } from '$lib/stores/page';
	import StreamMessage from '$lib/components/StreamMessage.svelte';
	import { Search, Globe, Lock, Eye, Users } from 'lucide-svelte';

	pageTitle.set('Sök');

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

<div class="mx-auto max-w-3xl bg-surface-2 pt-below-header">
	<!-- Sticky search header -->
	<div class="sticky top-0 z-10 bg-surface-2/95 backdrop-blur-sm border-b border-surface-3">
		<div class="px-4 pt-3 pb-2">
			<div class="relative">
				<Search size={16} class="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted" />
				<input
					type="text"
					bind:value={query}
					placeholder="Sök texter, möten, personer..."
					class="w-full rounded border border-surface-3 bg-surface-1 py-2 pl-9 pr-3 text-base text-txt placeholder:text-txt-muted focus:border-primary focus:bg-surface-2 focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
				/>
			</div>
		</div>

		<!-- Tabs -->
		<div class="flex gap-4 px-4">
			{#each tabs as tab}
				<button
					onclick={() => (activeTab = tab.key)}
					class="border-b-2 pb-1.5 text-xs font-medium transition-colors"
					class:border-primary={activeTab === tab.key}
					class:text-primary={activeTab === tab.key}
					class:border-transparent={activeTab !== tab.key}
					class:text-txt-muted={activeTab !== tab.key}
					class:hover:text-txt-secondary={activeTab !== tab.key}
				>
					{tab.label}
					{#if q.length >= 2}
						<span class="ml-0.5 text-txt-muted">
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
		<p class="px-4 py-8 text-center text-sm text-txt-muted">Skriv minst 2 tecken för att söka.</p>
	{:else if activeTab === 'texts'}
		{#each matchedTexts as text}
			<StreamMessage {text} compact />
		{:else}
			<p class="px-4 py-8 text-center text-sm text-txt-muted">Inga texter hittades.</p>
		{/each}
	{:else if activeTab === 'conferences'}
		{#each matchedConferences as conf}
			<a
				href="{base}/conferences/{conf.id}"
				class="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-1/80 transition-colors"
			>
				<span class="text-txt-muted">
					{#if conf.type === 'closed'}
						<Lock size={14} />
					{:else if conf.type === 'secret'}
						<Eye size={14} />
					{:else}
						<Globe size={14} />
					{/if}
				</span>
				<span class="min-w-0 flex-1 truncate text-sm font-medium text-txt-secondary">{conf.name}</span>
				<span class="text-xs text-txt-muted">{conf.members} medlemmar</span>
			</a>
		{:else}
			<p class="px-4 py-8 text-center text-sm text-txt-muted">Inga möten hittades.</p>
		{/each}
	{:else}
		{#each matchedUsers as user}
			<a
				href="{base}/users/{user.id}"
				class="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-1/80 transition-colors"
			>
				<span class="text-sm font-medium text-txt">{user.name}</span>
				<span class="text-xs text-txt-muted">{user.username}</span>
				<span class="ml-auto text-xs text-txt-muted">{user.totalTexts} texter</span>
			</a>
		{:else}
			<p class="px-4 py-8 text-center text-sm text-txt-muted">Inga personer hittades.</p>
		{/each}
	{/if}
</div>
