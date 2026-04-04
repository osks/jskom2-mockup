<script lang="ts">
	import { page } from '$app/state';
	import { getUserById, getMemberships, getConferenceById } from '$lib/data';
	import { pageTitle } from '$lib/stores/page';
	import { base } from '$app/paths';
	import { Mail } from 'lucide-svelte';

	const userId = $derived(Number(page.params.id));
	const user = $derived(getUserById(userId));
	const userMemberships = $derived(getMemberships(userId));

	$effect(() => {
		pageTitle.set(user?.name ?? 'Användare');
	});
</script>

<svelte:head>
	<title>{user?.name ?? 'Användare'} — jskom2</title>
</svelte:head>

<div class="mx-auto max-w-2xl bg-white">
	{#if user}
		<!-- User header -->
		<div class="border-b border-gray-100 px-4 py-4">
			<div>
				<h1 class="text-lg font-semibold text-gray-900">{user.name}</h1>
				<span class="text-xs text-gray-400">{user.username}</span>
			</div>

			<div class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
				<span>Medlem sedan {new Date(user.created).toLocaleDateString('sv-SE')}</span>
				<span>{user.totalTexts.toLocaleString('sv-SE')} texter</span>
				<span>Senast inloggad {new Date(user.lastLogin).toLocaleDateString('sv-SE')}</span>
			</div>

			<button
				class="mt-3 flex items-center gap-1.5 rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-50 hover:text-gray-700"
			>
				<Mail size={12} />
				Skicka personligt meddelande
			</button>
		</div>

		<!-- Memberships -->
		{#if userMemberships.length > 0}
			<div class="px-4 py-2">
				<span class="text-xs font-medium text-gray-500">Medlem i</span>
			</div>
			{#each userMemberships as m}
				{@const conf = getConferenceById(m.conferenceId)}
				{#if conf}
					<a
						href="{base}/conferences/{conf.id}"
						class="flex items-center justify-between px-4 py-2 hover:bg-gray-50/80 transition-colors"
					>
						<span class="text-sm text-gray-700">{conf.name}</span>
						<span class="text-xs text-gray-400">Prioritet {m.priority}</span>
					</a>
				{/if}
			{/each}
		{/if}
	{:else}
		<p class="px-4 py-8 text-center text-sm text-gray-400">Användaren hittades inte.</p>
	{/if}
</div>
