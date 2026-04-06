<script lang="ts">
	import { connections, activeConnectionId, switchConnection, disconnectConnection } from '$lib/stores/auth';
	import { get } from 'svelte/store';
	import { getMemberships, getAuthorColor } from '$lib/data';
	import { Plus } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';

	interface Props {
		onNavigate?: () => void;
	}

	let { onNavigate }: Props = $props();

	function totalUnread(userId: number): number {
		return getMemberships(userId).reduce((sum, m) => sum + m.unread, 0);
	}

	function handleSwitch(id: string) {
		switchConnection(id);
		onNavigate?.();
	}

	function handleAdd() {
		goto(`${base}/login`);
		onNavigate?.();
	}
</script>

<div class="flex h-full w-16 flex-col items-center bg-gray-100 py-3 gap-2 safe-top safe-bottom">
	{#each $connections as conn}
		{@const active = conn.id === $activeConnectionId}
		{@const color = getAuthorColor(conn.userId)}
		{@const unread = totalUnread(conn.userId)}
		<div class="relative">
			<button
				onclick={() => handleSwitch(conn.id)}
				class="flex h-11 w-11 items-center justify-center text-sm font-semibold text-white transition-all {color.bg} {active ? 'rounded-xl ring-2 ring-lyskom-500 ring-offset-2 ring-offset-gray-100' : 'rounded-2xl hover:rounded-xl opacity-80 hover:opacity-100'}"
				title="{conn.userName} @ {conn.serverName}"
			>
				{conn.userName.charAt(0).toUpperCase()}
			</button>
			{#if unread > 0}
				<span class="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
					{unread > 99 ? '99+' : unread}
				</span>
			{/if}
		</div>
	{/each}

	<button
		onclick={handleAdd}
		class="flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 text-gray-400 transition-all hover:rounded-xl hover:border-gray-400 hover:text-gray-500"
		title="Anslut till server"
	>
		<Plus size={18} />
	</button>
</div>
