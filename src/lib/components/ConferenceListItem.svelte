<script lang="ts">
	import type { Conference, Membership } from '$lib/types';
	import { Lock, Globe, Eye } from 'lucide-svelte';
	import { base } from '$app/paths';

	interface Props {
		conference: Conference;
		membership?: Membership;
	}

	let { conference, membership }: Props = $props();

	const priorityColor = $derived(
		membership
			? membership.priority >= 200
				? 'border-l-lyskom-600'
				: membership.priority >= 100
					? 'border-l-lyskom-300'
					: 'border-l-gray-300'
			: 'border-l-gray-200'
	);
</script>

<a
	href="{base}/conferences/{conference.id}"
	class="flex items-center gap-3 rounded-lg border border-gray-200 border-l-4 {priorityColor} bg-white px-4 py-3 shadow-sm hover:bg-gray-50 transition-colors"
>
	<div class="shrink-0 text-gray-400">
		{#if conference.type === 'closed'}
			<Lock size={16} />
		{:else if conference.type === 'secret'}
			<Eye size={16} />
		{:else}
			<Globe size={16} />
		{/if}
	</div>

	<div class="min-w-0 flex-1">
		<div class="font-medium text-gray-900 truncate">{conference.name}</div>
		<div class="text-xs text-gray-500">{conference.members} medlemmar</div>
	</div>

	{#if membership && membership.unread > 0}
		<span
			class="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white"
		>
			{membership.unread}
		</span>
	{/if}
</a>
