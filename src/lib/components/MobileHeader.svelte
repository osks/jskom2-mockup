<script lang="ts">
	import { toggleSidebar } from '$lib/stores/ui';
	import { readingState } from '$lib/stores/reading';
	import { getConferenceById } from '$lib/data';
	import { page } from '$app/state';
	import { base } from '$app/paths';
	import { Search, Menu } from 'lucide-svelte';

	const isReadingPage = $derived(
		page.url.pathname === `${base}/read` || page.url.pathname.startsWith(`${base}/read/`)
	);

	const title = $derived(() => {
		if (isReadingPage && $readingState.currentConference) {
			const conf = getConferenceById($readingState.currentConference);
			return conf?.name ?? 'Läsa';
		}
		const path = page.url.pathname.replace(base, '');
		if (path.startsWith('/who')) return 'Vilka';
		if (path.startsWith('/search')) return 'Sök';
		if (path.startsWith('/users')) return 'Användare';
		if (path.startsWith('/texts')) return 'Text';
		if (path.startsWith('/conferences')) return 'Möte';
		if (path.startsWith('/read')) return 'Läsa';
		return 'jskom2';
	});
</script>

<header class="flex h-11 shrink-0 items-center gap-3 bg-gray-900 px-3 text-white md:hidden">
	<button
		onclick={toggleSidebar}
		class="flex h-8 w-8 items-center justify-center rounded text-gray-300 hover:bg-gray-800 hover:text-white"
	>
		<Menu size={20} />
	</button>

	<span class="min-w-0 flex-1 truncate text-sm font-medium">{title()}</span>

	<a
		href="{base}/search"
		class="flex h-8 w-8 items-center justify-center rounded text-gray-300 hover:bg-gray-800 hover:text-white"
	>
		<Search size={18} />
	</a>
</header>
