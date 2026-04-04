<script lang="ts">
	import type { Session } from '$lib/types';
	import { getConferenceById, getUserById, getAuthorColor, formatIdleTime } from '$lib/data';
	import { base } from '$app/paths';

	interface Props {
		session: Session;
		isCurrentUser?: boolean;
	}

	let { session, isCurrentUser = false }: Props = $props();

	const user = $derived(getUserById(session.userId));
	const conf = $derived(getConferenceById(session.currentConference));
	const colors = $derived(getAuthorColor(session.userId));
	const loginTimeStr = $derived(
		new Date(session.loginTime).toLocaleTimeString('sv-SE', {
			hour: '2-digit',
			minute: '2-digit'
		})
	);
</script>

<div
	class="flex gap-3 px-4 py-2.5 transition-colors hover:bg-gray-50/80"
	class:bg-lyskom-50={isCurrentUser}
>
	<div class="shrink-0 w-0.5 self-stretch rounded-full {colors.border}"></div>

	<div class="min-w-0 flex-1">
		<div class="flex items-baseline gap-2">
			<a
				href="{base}/users/{session.userId}"
				class="text-sm font-semibold {colors.text} hover:underline"
			>
				{user?.name ?? 'Okänd'}
			</a>
			{#if isCurrentUser}
				<span class="text-xs text-lyskom-600">*</span>
			{/if}
			<span class="text-xs text-gray-400">{session.doing}</span>
		</div>

		<div class="mt-0.5 flex items-center gap-3 text-xs text-gray-400">
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
</div>
