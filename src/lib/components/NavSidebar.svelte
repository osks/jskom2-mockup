<script lang="ts">
	import { currentUser, connections, activeConnection, activeConnectionId, switchConnection, logout } from '$lib/stores/auth';
	import { getMemberships, getConferenceById } from '$lib/data';
	import { BookOpen, Users, PenSquare, Search, LogOut, Plus, KeyRound } from 'lucide-svelte';
	import { startCompose } from '$lib/stores/reading';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { base } from '$app/paths';

	interface Props {
		onNavigate?: () => void;
	}

	let { onNavigate }: Props = $props();

	let menuOpen = $state(false);

	const memberships = $derived(
		$currentUser ? getMemberships($currentUser.id) : []
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
		onNavigate?.();
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

	<!-- Session pill -->
	{#if $activeConnection}
		<div class="border-t border-gray-200 px-3 py-3">
			<div class="relative">
				<button
					onclick={() => menuOpen = !menuOpen}
					class="flex w-full items-center gap-2 rounded-full bg-gray-200/70 px-4 py-2 text-left transition-colors hover:bg-gray-200"
				>
					<div class="min-w-0 flex-1">
						<div class="truncate text-sm font-medium text-gray-900">{$activeConnection.userName}</div>
						<div class="truncate text-[11px] text-gray-400 font-mono">{$activeConnection.serverName}</div>
					</div>
				</button>

				<!-- Popover menu -->
				{#if menuOpen}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div class="fixed inset-0 z-30" onclick={() => menuOpen = false}></div>
					<div class="absolute bottom-full left-0 right-0 z-40 mb-2 rounded-2xl bg-white py-1.5 shadow-lg ring-1 ring-gray-200/60">
						<!-- Other connections -->
						{#if $connections.length > 1}
							{#each $connections as conn}
								{@const active = conn.id === $activeConnectionId}
								{@const unread = totalUnread(conn.userId)}
								<button
									onclick={() => { handleSwitch(conn.id); menuOpen = false; }}
									class="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors {active ? 'text-gray-900 font-medium' : 'text-gray-700'} active:bg-gray-100"
								>
									<div class="min-w-0 flex-1">
										<div class="truncate">{conn.userName}</div>
										<div class="truncate text-[11px] text-gray-400 font-mono">{conn.serverName}</div>
									</div>
									{#if unread > 0}
										<span class="text-xs text-gray-500">{unread}</span>
									{/if}
								</button>
							{/each}
							<div class="mx-3 my-1 border-t border-gray-100"></div>
						{/if}

						<button
							onclick={() => { handleAddConnection(); menuOpen = false; }}
							class="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-700 active:bg-gray-100"
						>
							<Plus size={14} class="text-gray-400" />
							Anslut till server
						</button>

						<div class="mx-3 my-1 border-t border-gray-100"></div>

						<button
							onclick={() => menuOpen = false}
							class="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-700 active:bg-gray-100"
						>
							<KeyRound size={14} class="text-gray-400" />
							Byt lösenord
						</button>
						<button
							onclick={() => { menuOpen = false; logout(); window.location.href = `${base}/login`; }}
							class="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-700 active:bg-gray-100"
						>
							<LogOut size={14} class="text-gray-400" />
							Logga ut
						</button>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</nav>
