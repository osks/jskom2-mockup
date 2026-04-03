<script lang="ts">
	import type { TextInfo } from '$lib/types';
	import { getTextById } from '$lib/data';
	import TextCard from './TextCard.svelte';
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
		class={depth > 0 ? 'ml-4 border-l-2 border-lyskom-100 pl-4 md:ml-6 md:pl-6' : ''}
		class:ring-2={highlightId === text.id}
		class:ring-lyskom-500={highlightId === text.id}
		class:rounded-lg={highlightId === text.id}
	>
		<TextCard {text} />

		{#if text.commentedIn && text.commentedIn.length > 0}
			<div class="mt-3 space-y-3">
				{#each text.commentedIn as childId}
					<TextThread textId={childId} {highlightId} depth={depth + 1} />
				{/each}
			</div>
		{/if}
	</div>
{/if}
