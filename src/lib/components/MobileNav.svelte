<script lang="ts">
	import { BookOpen, MessageSquare, PenSquare, Users, Search } from 'lucide-svelte';
	import { page } from '$app/state';

	const tabs = [
		{ href: '/read', label: 'Läsa', icon: BookOpen },
		{ href: '/conferences', label: 'Möten', icon: MessageSquare },
		{ href: '/compose', label: 'Skriv', icon: PenSquare },
		{ href: '/who', label: 'Vilka', icon: Users },
		{ href: '/search', label: 'Sök', icon: Search }
	];

	function isActive(href: string): boolean {
		return page.url.pathname === href || page.url.pathname.startsWith(href + '/');
	}
</script>

<nav class="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white md:hidden">
	<div class="flex">
		{#each tabs as tab}
			<a
				href={tab.href}
				class="flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors"
				class:text-lyskom-600={isActive(tab.href)}
				class:text-gray-400={!isActive(tab.href)}
			>
				<tab.icon size={20} />
				{tab.label}
			</a>
		{/each}
	</div>
</nav>
