<script lang="ts">
	import { page } from '$app/state';
	import { getUserById, getMemberships, getConferenceById } from '$lib/data';
	import UserBadge from '$lib/components/UserBadge.svelte';
	import { Calendar, FileText, Mail } from 'lucide-svelte';

	const userId = $derived(Number(page.params.id));
	const user = $derived(getUserById(userId));
	const userMemberships = $derived(getMemberships(userId));

	const initials = $derived(
		user ? user.name.split(' ').map((n: string) => n[0]).join('') : '?'
	);
	const avatarColors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-purple-500', 'bg-cyan-500', 'bg-orange-500', 'bg-indigo-500'];
	const avatarColor = $derived(avatarColors[userId % avatarColors.length]);
</script>

<svelte:head>
	<title>{user?.name ?? 'Användare'} — jskom2</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-4 py-6">
	{#if user}
		<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<div class="flex items-start gap-4">
				<!-- Large avatar -->
				<div
					class="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white {avatarColor}"
				>
					{initials}
				</div>

				<div>
					<h1 class="text-2xl font-bold text-gray-900">{user.name}</h1>
					<p class="text-sm text-gray-500">({user.username})</p>

					<div class="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
						<span class="flex items-center gap-1">
							<Calendar size={14} />
							Medlem sedan {new Date(user.created).toLocaleDateString('sv-SE')}
						</span>
						<span class="flex items-center gap-1">
							<FileText size={14} />
							{user.totalTexts.toLocaleString('sv-SE')} texter
						</span>
					</div>

					<div class="mt-2 text-sm text-gray-500">
						Senast inloggad: {new Date(user.lastLogin).toLocaleString('sv-SE')}
					</div>
				</div>
			</div>

			<div class="mt-4">
				<button
					class="inline-flex items-center gap-1.5 rounded-md bg-lyskom-50 px-3 py-1.5 text-sm font-medium text-lyskom-700 hover:bg-lyskom-100 transition-colors"
				>
					<Mail size={14} />
					Skicka personligt meddelande
				</button>
			</div>
		</div>

		<!-- Memberships -->
		{#if userMemberships.length > 0}
			<h2 class="mt-8 mb-3 text-lg font-semibold text-gray-900">Medlem i</h2>
			<div class="rounded-lg border border-gray-200 bg-white shadow-sm divide-y divide-gray-100">
				{#each userMemberships as m}
					{@const conf = getConferenceById(m.conferenceId)}
					{#if conf}
						<a
							href="/conferences/{conf.id}"
							class="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
						>
							<span class="text-sm font-medium text-gray-700">{conf.name}</span>
							<span class="text-xs text-gray-400">Prioritet {m.priority}</span>
						</a>
					{/if}
				{/each}
			</div>
		{/if}
	{:else}
		<p class="text-gray-500">Användaren hittades inte.</p>
	{/if}
</div>
