<script lang="ts">
	import type { Session } from '$lib/types';
	import { getConferenceById, getUserById, formatIdleTime } from '$lib/data';
	import { base } from '$app/paths';

	interface Props {
		session: Session;
		isCurrentUser?: boolean;
	}

	let { session, isCurrentUser = false }: Props = $props();

	const user = $derived(getUserById(session.userId));
	const conf = $derived(getConferenceById(session.currentConference));
	const loginTimeStr = $derived(
		new Date(session.loginTime).toLocaleTimeString('sv-SE', {
			hour: '2-digit',
			minute: '2-digit'
		})
	);
</script>

<div
	class="px-4 py-2.5 transition-colors hover:bg-surface-1/80 {isCurrentUser ? 'bg-primary/10' : ''}"
>
	<div class="flex items-baseline gap-2">
		<a
			href="{base}/users/{session.userId}"
			class="text-sm font-semibold text-txt hover:underline"
		>
			{user?.name ?? 'Okänd'}
		</a>
		{#if isCurrentUser}
			<span class="text-xs text-txt-muted">*</span>
		{/if}
		<span class="text-xs text-txt-secondary">{session.doing}</span>
	</div>

	<div class="mt-0.5 flex items-center gap-3 text-xs text-txt-muted">
		{#if conf}
			<span>{conf.name}</span>
		{/if}
		<span>{session.clientName}</span>
		<span>
			{#if session.idleSeconds > 0}
				Inaktiv {formatIdleTime(session.idleSeconds)}
			{:else}
				Aktiv
			{/if}
		</span>
		<span>Sedan {loginTimeStr}</span>
	</div>
</div>
