<script lang="ts">
	import { readingState } from '$lib/stores/reading';
	import type { StreamItem } from '$lib/stores/reading';
	import { getTextById, getConferenceById } from '$lib/data';
	import StreamMessage from './StreamMessage.svelte';
	import { onMount, tick } from 'svelte';

	let streamContainer: HTMLElement | undefined = $state();

	onMount(async () => {
		await tick();
		if ($readingState.firstUnreadIndex >= 0) {
			const el = document.getElementById('stream-unread-divider');
			if (el && streamContainer) {
				el.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}
		}
	});
</script>

<div bind:this={streamContainer} class="flex-1 overflow-y-auto">
	<div class="divide-y divide-gray-100">
		{#each $readingState.streamItems as item, i}
			{#if item.type === 'conference-divider'}
				{@const conf = item.conferenceId ? getConferenceById(item.conferenceId) : null}
				<div
					id="conference-{item.conferenceId}"
					class="sticky top-0 z-10 flex items-center gap-3 bg-gray-50/95 backdrop-blur-sm px-4 py-2"
				>
					<div class="h-px flex-1 bg-gray-200"></div>
					{#if conf}
						<span class="text-xs font-semibold uppercase tracking-wider text-gray-500">
							{conf.name}
						</span>
					{/if}
					<div class="h-px flex-1 bg-gray-200"></div>
				</div>
			{:else if item.type === 'unread-divider'}
				<div
					id="stream-unread-divider"
					class="flex items-center gap-3 px-4 py-1.5"
				>
					<div class="h-px flex-1 bg-red-300"></div>
					<span class="text-xs font-semibold text-red-500">olästa</span>
					<div class="h-px flex-1 bg-red-300"></div>
				</div>
			{:else if item.type === 'text' && item.textId}
				{@const text = getTextById(item.textId)}
				{#if text}
					<StreamMessage {text} />
				{/if}
			{/if}
		{/each}

		{#if $readingState.streamItems.length === 0}
			<div class="flex items-center justify-center py-20 text-sm text-gray-400">
				Inga texter att visa.
			</div>
		{/if}
	</div>
</div>
