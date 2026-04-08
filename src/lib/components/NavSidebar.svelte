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

<nav class="flex h-full w-full flex-col bg-surface-3 text-txt-secondary safe-bottom">
	<!-- Logo -->
	<div class="safe-top px-4 py-3">
		<a href="{base}/read" onclick={handleNav} class="text-base font-bold text-txt">jskom2</a>
	</div>

	<!-- Main nav -->
	<div class="flex-1 overflow-y-auto px-2 py-1">
		<a
			href="{base}/read"
			onclick={handleNav}
			class="flex items-center gap-2 rounded px-3 py-1.5 text-sm transition-colors"
			class:bg-surface-5={isActive('/read')}
			class:text-txt={isActive('/read')}
			class:hover:bg-surface-5={!isActive('/read')}
			class:hover:text-txt={!isActive('/read')}
		>
			<BookOpen size={16} />
			Läsa
		</a>

		<!-- Conference list -->
		<div class="mt-4">
			<div class="px-3 text-[11px] font-semibold uppercase tracking-wider text-txt-secondary">Möten</div>
			<div class="mt-1 space-y-px">
				{#each memberships as m}
					{@const conf = getConferenceById(m.conferenceId)}
					{#if conf}
						<button
							onclick={() => scrollToConference(conf.id)}
							class="flex w-full items-center justify-between rounded px-3 py-1.5 text-sm transition-colors hover:bg-surface-5 hover:text-txt"
						>
							<span class="truncate">{conf.name}</span>
							{#if m.unread > 0}
								<span class="ml-2 text-xs text-txt-secondary">{m.unread}</span>
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
				class:bg-surface-5={isActive('/who')}
				class:text-txt={isActive('/who')}
				class:hover:bg-surface-5={!isActive('/who')}
				class:hover:text-txt={!isActive('/who')}
			>
				<Users size={16} />
				Vilka
			</a>
			<button
				onclick={handleCompose}
				class="flex w-full items-center gap-2 rounded px-3 py-1.5 text-sm transition-colors hover:bg-surface-5 hover:text-txt"
			>
				<PenSquare size={16} />
				Skriv
			</button>
			<a
				href="{base}/search"
				onclick={handleNav}
				class="flex items-center gap-2 rounded px-3 py-1.5 text-sm transition-colors"
				class:bg-surface-5={isActive('/search')}
				class:text-txt={isActive('/search')}
				class:hover:bg-surface-5={!isActive('/search')}
				class:hover:text-txt={!isActive('/search')}
			>
				<Search size={16} />
				Sök
			</a>
		</div>
	</div>

	<!-- Session bar -->
	{#if $activeConnection}
		<div class="relative">
			<button
				onclick={() => menuOpen = !menuOpen}
				class="flex w-full items-center gap-2 border-t border-surface-5 px-4 py-3 text-left transition-colors hover:bg-surface-5"
			>
				<div class="min-w-0 flex-1">
					<div class="truncate text-sm font-medium text-txt">{$activeConnection.userName}</div>
					<div class="truncate text-[11px] text-txt-muted font-mono">{$activeConnection.serverName}</div>
				</div>
			</button>

			<!-- Popover menu -->
			{#if menuOpen}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div class="fixed inset-0 z-30" onclick={() => menuOpen = false}></div>
				<div class="absolute bottom-full left-2 right-2 z-40 mb-2 rounded-2xl bg-white py-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border-[0.5px] border-surface-5">
						<!-- Other connections -->
						{#if $connections.length > 1}
							{#each $connections as conn}
								{@const active = conn.id === $activeConnectionId}
								{@const unread = totalUnread(conn.userId)}
								<button
									onclick={() => { handleSwitch(conn.id); menuOpen = false; }}
									class="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors {active ? 'text-txt font-medium' : 'text-txt-secondary'} hover:bg-surface-2 active:bg-surface-3"
								>
									<div class="min-w-0 flex-1">
										<div class="truncate">{conn.userName}</div>
										<div class="truncate text-[11px] text-txt-muted font-mono">{conn.serverName}</div>
									</div>
									{#if unread > 0}
										<span class="text-xs text-txt-secondary">{unread}</span>
									{/if}
								</button>
							{/each}
							<div class="mx-3 my-1 border-t border-surface-2"></div>
						{/if}

						<button
							onclick={() => { handleAddConnection(); menuOpen = false; }}
							class="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-txt-secondary hover:bg-surface-2 active:bg-surface-3"
						>
							<Plus size={14} class="text-txt-muted" />
							Anslut till server
						</button>

						<div class="mx-3 my-1 border-t border-surface-2"></div>

						<button
							onclick={() => menuOpen = false}
							class="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-txt-secondary hover:bg-surface-2 active:bg-surface-3"
						>
							<KeyRound size={14} class="text-txt-muted" />
							Byt lösenord
						</button>
						<button
							onclick={() => { menuOpen = false; logout(); window.location.href = `${base}/login`; }}
							class="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-txt-secondary hover:bg-surface-2 active:bg-surface-3"
						>
							<LogOut size={14} class="text-txt-muted" />
							Logga ut
						</button>
					</div>
				{/if}
		</div>
	{/if}
</nav>
