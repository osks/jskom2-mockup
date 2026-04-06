<script lang="ts">
	import { currentUser } from '$lib/stores/auth';
	import { getMemberships, getConferenceById } from '$lib/data';
	import { BookOpen, Users, PenSquare, Search, LogOut } from 'lucide-svelte';
	import { logout } from '$lib/stores/auth';
	import { startCompose } from '$lib/stores/reading';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { base } from '$app/paths';

	interface Props {
		onNavigate?: () => void;
	}

	let { onNavigate }: Props = $props();

	const memberships = $derived(
		$currentUser ? getMemberships($currentUser.id) : []
	);

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

	<!-- User info -->
	{#if $currentUser}
		<div class="border-t border-gray-200 px-4 py-3">
			<a href="{base}/users/{$currentUser.id}" onclick={handleNav} class="text-sm text-gray-700 hover:text-gray-900">
				{$currentUser.name}
			</a>
			<button
				onclick={() => { logout(); window.location.href = `${base}/login`; }}
				class="mt-1 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
			>
				<LogOut size={12} />
				Logga ut
			</button>
		</div>
	{/if}
</nav>
