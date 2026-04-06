<script lang="ts">
	import { currentUser, connections, activeConnection, activeConnectionId, switchConnection, disconnectConnection, logout } from '$lib/stores/auth';
	import { get } from 'svelte/store';
	import { getMemberships, getConferenceById, getAuthorColor } from '$lib/data';
	import { BookOpen, Users, PenSquare, Search, LogOut, Plus, KeyRound, ChevronDown, X } from 'lucide-svelte';
	import { startCompose } from '$lib/stores/reading';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { base } from '$app/paths';

	interface Props {
		onNavigate?: () => void;
	}

	let { onNavigate }: Props = $props();

	let accountsExpanded = $state(false);

	const memberships = $derived(
		$currentUser ? getMemberships($currentUser.id) : []
	);

	const otherConnections = $derived(
		$connections.filter((c) => c.id !== $activeConnectionId)
	);

	const currentUserColor = $derived(
		$currentUser ? getAuthorColor($currentUser.id) : null
	);

	function totalUnread(userId: number): number {
		return getMemberships(userId).reduce((sum, m) => sum + m.unread, 0);
	}

	function isActive(path: string): boolean {
		const full = `${base}${path}`;
		return page.url.pathname === full || page.url.pathname.startsWith(full + '/');
	}

	function scrollToConference(conferenceId: number) {
		if (isActive('/read')) {
			const el = document.getElementById(`conference-${conferenceId}`);
			if (el) {
				el.scrollIntoView({ behavior: 'smooth', block: 'start' });
				onNavigate?.();
				return;
			}
		}
		goto(`${base}/read`);
		onNavigate?.();
	}

	function handleNav() {
		onNavigate?.();
	}

	function handleCompose() {
		startCompose();
		onNavigate?.();
	}

	function handleSwitch(id: string) {
		switchConnection(id);
		accountsExpanded = false;
		onNavigate?.();
	}

	function handleDisconnect(e: MouseEvent, id: string) {
		e.stopPropagation();
		disconnectConnection(id);
		if (get(connections).length === 0) {
			window.location.href = `${base}/login`;
		}
	}

	function handleAddConnection() {
		goto(`${base}/login`);
		onNavigate?.();
	}
</script>

<nav class="flex h-full w-full flex-col bg-gray-50 text-gray-600 safe-bottom">
	<!-- Logo -->
	<div class="safe-top px-4 py-3">
		<a href="{base}/read" onclick={handleNav} class="text-base font-bold text-gray-900">jskom2</a>
	</div>

	<!-- Main nav -->
	<div class="flex-1 overflow-y-auto px-2 py-1">
		<a
			href="{base}/read"
			onclick={handleNav}
			class="flex items-center gap-2 rounded px-3 py-1.5 text-sm transition-colors"
			class:bg-gray-200={isActive('/read')}
			class:text-gray-900={isActive('/read')}
			class:hover:bg-gray-200={!isActive('/read')}
			class:hover:text-gray-900={!isActive('/read')}
		>
			<BookOpen size={16} />
			Läsa
		</a>

		<!-- Conference list -->
		<div class="mt-4">
			<div class="px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Möten</div>
			<div class="mt-1 space-y-px">
				{#each memberships as m}
					{@const conf = getConferenceById(m.conferenceId)}
					{#if conf}
						<button
							onclick={() => scrollToConference(conf.id)}
							class="flex w-full items-center justify-between rounded px-3 py-1.5 text-sm transition-colors hover:bg-gray-200 hover:text-gray-900"
						>
							<span class="truncate">{conf.name}</span>
							{#if m.unread > 0}
								<span class="ml-2 text-xs text-gray-500">{m.unread}</span>
							{/if}
						</button>
					{/if}
				{/each}
			</div>
		</div>

		<!-- Other nav items -->
		<div class="mt-4 space-y-px">
			<a
				href="{base}/who"
				onclick={handleNav}
				class="flex items-center gap-2 rounded px-3 py-1.5 text-sm transition-colors"
				class:bg-gray-200={isActive('/who')}
				class:text-gray-900={isActive('/who')}
				class:hover:bg-gray-200={!isActive('/who')}
				class:hover:text-gray-900={!isActive('/who')}
			>
				<Users size={16} />
				Vilka
			</a>
			<button
				onclick={handleCompose}
				class="flex w-full items-center gap-2 rounded px-3 py-1.5 text-sm transition-colors hover:bg-gray-200 hover:text-gray-900"
			>
				<PenSquare size={16} />
				Skriv
			</button>
			<a
				href="{base}/search"
				onclick={handleNav}
				class="flex items-center gap-2 rounded px-3 py-1.5 text-sm transition-colors"
				class:bg-gray-200={isActive('/search')}
				class:text-gray-900={isActive('/search')}
				class:hover:bg-gray-200={!isActive('/search')}
				class:hover:text-gray-900={!isActive('/search')}
			>
				<Search size={16} />
				Sök
			</a>
		</div>
	</div>

	<!-- Account section -->
	{#if $activeConnection && $currentUser}
		<div class="border-t border-gray-200">
			<!-- Current account header (click to expand) -->
			<button
				onclick={() => accountsExpanded = !accountsExpanded}
				class="flex w-full items-center gap-2.5 px-4 py-3 text-left transition-colors hover:bg-gray-100"
			>
					<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white {currentUserColor?.bg}">
					{$currentUser.name.charAt(0)}
				</div>
				<div class="min-w-0 flex-1">
					<div class="truncate text-sm font-medium text-gray-900">{$currentUser.name}</div>
					<div class="truncate text-xs text-gray-400 font-mono">{$activeConnection.serverName}</div>
				</div>
				<ChevronDown size={14} class="shrink-0 text-gray-400 transition-transform {accountsExpanded ? 'rotate-180' : ''}" />
			</button>

			<!-- Expanded: other accounts + actions -->
			{#if accountsExpanded}
				<div class="border-t border-gray-100 px-2 py-2 space-y-px">
					<!-- Other connections -->
					{#each otherConnections as conn}
						{@const color = getAuthorColor(conn.userId)}
						{@const unread = totalUnread(conn.userId)}
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div
							onclick={() => handleSwitch(conn.id)}
							class="flex w-full cursor-pointer items-center gap-2.5 rounded px-2 py-1.5 text-left transition-colors hover:bg-gray-200 group"
						>
							<div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white {color.bg}">
								{conn.userName.charAt(0)}
							</div>
							<div class="min-w-0 flex-1">
								<div class="truncate text-sm text-gray-700">{conn.userName}</div>
								<div class="truncate text-[11px] text-gray-400 font-mono">{conn.serverName}</div>
							</div>
							{#if unread > 0}
								<span class="text-xs text-gray-500">{unread}</span>
							{/if}
							<button
								onclick={(e) => handleDisconnect(e, conn.id)}
								class="shrink-0 rounded p-0.5 text-gray-300 opacity-0 transition-opacity hover:text-gray-500 group-hover:opacity-100"
								title="Koppla från"
							>
								<X size={12} />
							</button>
						</div>
					{/each}

					<!-- Add connection -->
					<button
						onclick={handleAddConnection}
						class="flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-sm text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
					>
						<div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-gray-300">
							<Plus size={14} />
						</div>
						Anslut till server
					</button>

					<!-- Divider + account actions -->
					<div class="border-t border-gray-100 mt-1 pt-1">
						<button
							class="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
						>
							<KeyRound size={12} />
							Byt lösenord
						</button>
						<button
							onclick={() => { logout(); window.location.href = `${base}/login`; }}
							class="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
						>
							<LogOut size={12} />
							Logga ut
						</button>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</nav>
