<script lang="ts">
	import type { Session } from '$lib/types';
	import { getConferenceById, formatIdleTime } from '$lib/data';
	import UserBadge from './UserBadge.svelte';

	interface Props {
		session: Session;
		isCurrentUser?: boolean;
	}

	let { session, isCurrentUser = false }: Props = $props();

	const conf = $derived(getConferenceById(session.currentConference));
	const loginTimeStr = $derived(
		new Date(session.loginTime).toLocaleTimeString('sv-SE', {
			hour: '2-digit',
			minute: '2-digit'
		})
	);
</script>

<div
	class="flex flex-col gap-1 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:gap-4"
	class:ring-1={isCurrentUser}
	class:ring-lyskom-300={isCurrentUser}
>
	<div class="flex items-center gap-2 sm:w-48">
		<span class="font-mono text-xs text-gray-400">{session.sessionId}</span>
		{#if isCurrentUser}
			<span class="font-mono text-xs text-lyskom-600">*</span>
		{/if}
		<UserBadge userId={session.userId} />
	</div>

	<div class="flex-1 text-sm text-gray-600">
		{session.doing}
	</div>

	<div class="flex items-center gap-4 text-xs text-gray-400">
		{#if conf}
			<span class="truncate">{conf.name}</span>
		{/if}
		<span class="shrink-0">{session.clientName}</span>
		<span class="shrink-0">
			{#if session.idleSeconds > 0}
				Inaktiv {formatIdleTime(session.idleSeconds)}
			{:else}
				Aktiv
			{/if}
		</span>
		<span class="shrink-0">Sedan {loginTimeStr}</span>
	</div>
</div>
