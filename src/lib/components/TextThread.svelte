<script lang="ts">
	import type { TextInfo } from '$lib/types';
	import { getTextById } from '$lib/data';
	import StreamMessage from './StreamMessage.svelte';
	import TextThread from './TextThread.svelte';

	interface Props {
		textId: number;
		highlightId?: number;
		depth?: number;
	}

	let { textId, highlightId, depth = 0 }: Props = $props();

	const text = $derived(getTextById(textId));
</script>

{#if text}
	<div
		class="{depth > 0 ? 'ml-3 border-l-2 border-surface-2 md:ml-4' : ''} {highlightId === text.id ? 'bg-primary/10' : ''}"
	>
		<StreamMessage {text} />

		{#if text.commentedIn && text.commentedIn.length > 0}
			{#each text.commentedIn as childId}
				<TextThread textId={childId} {highlightId} depth={depth + 1} />
			{/each}
		{/if}
	</div>
{/if}
