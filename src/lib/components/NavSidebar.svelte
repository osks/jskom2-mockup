<script lang="ts">
	import { currentUser } from '$lib/stores/auth';
	import { getMemberships, getConferenceById } from '$lib/data';
	import { BookOpen, Users, PenSquare, Search, LogOut } from 'lucide-svelte';
	import { logout } from '$lib/stores/auth';
	import { page } from '$app/state';

	const memberships = $derived(
		$currentUser ? getMemberships($currentUser.id) : []
	);

	function isActive(path: string): boolean {
		return page.url.pathname === path || page.url.pathname.startsWith(path + '/');
	}
</script>

<nav class="flex h-full w-56 flex-col border-r border-gray-200 bg-white">
	<!-- Logo -->
	<div class="border-b border-gray-100 px-4 py-3">
		<a href="/read" class="text-lg font-bold text-lyskom-700">jskom2</a>
	</div>

	<!-- Main nav -->
	<div class="flex-1 overflow-y-auto px-2 py-3">
		<a
			href="/read"
			class="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors"
			class:bg-lyskom-50={isActive('/read')}
			class:text-lyskom-700={isActive('/read')}
			class:text-gray-700={!isActive('/read')}
			class:hover:bg-gray-50={!isActive('/read')}
		>
			<BookOpen size={16} />
			Läsa
		</a>

		<!-- Conference list -->
		<div class="mt-4">
			<div class="px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Möten</div>
			<div class="mt-1 space-y-0.5">
				{#each memberships as m}
					{@const conf = getConferenceById(m.conferenceId)}
					{#if conf}
						<a
							href="/conferences/{conf.id}"
							class="flex items-center justify-between rounded-md px-3 py-1.5 text-sm transition-colors"
							class:bg-lyskom-50={isActive(`/conferences/${conf.id}`)}
							class:text-lyskom-700={isActive(`/conferences/${conf.id}`)}
							class:text-gray-700={!isActive(`/conferences/${conf.id}`)}
							class:hover:bg-gray-50={!isActive(`/conferences/${conf.id}`)}
						>
							<span class="truncate">{conf.name}</span>
							{#if m.unread > 0}
								<span
									class="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white"
								>
									{m.unread}
								</span>
							{/if}
						</a>
					{/if}
				{/each}
			</div>
		</div>

		<!-- Other nav items -->
		<div class="mt-4 space-y-0.5">
			<a
				href="/who"
				class="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors"
				class:bg-lyskom-50={isActive('/who')}
				class:text-lyskom-700={isActive('/who')}
				class:text-gray-700={!isActive('/who')}
				class:hover:bg-gray-50={!isActive('/who')}
			>
				<Users size={16} />
				Vilka
			</a>
			<a
				href="/compose"
				class="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors"
				class:bg-lyskom-50={isActive('/compose')}
				class:text-lyskom-700={isActive('/compose')}
				class:text-gray-700={!isActive('/compose')}
				class:hover:bg-gray-50={!isActive('/compose')}
			>
				<PenSquare size={16} />
				Skriv
			</a>
			<a
				href="/search"
				class="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors"
				class:bg-lyskom-50={isActive('/search')}
				class:text-lyskom-700={isActive('/search')}
				class:text-gray-700={!isActive('/search')}
				class:hover:bg-gray-50={!isActive('/search')}
			>
				<Search size={16} />
				Sök
			</a>
		</div>
	</div>

	<!-- User info -->
	{#if $currentUser}
		<div class="border-t border-gray-100 px-4 py-3">
			<a href="/users/{$currentUser.id}" class="text-sm font-medium text-gray-700 hover:underline">
				{$currentUser.name}
			</a>
			<button
				onclick={() => { logout(); window.location.href = '/login'; }}
				class="mt-1 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
			>
				<LogOut size={12} />
				Logga ut
			</button>
		</div>
	{/if}
</nav>
