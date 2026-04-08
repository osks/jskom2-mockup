<script lang="ts">
	import { slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { readingState, expandCompose } from '$lib/stores/reading';
	import { getTextById } from '$lib/data';
	import ComposeForm from './ComposeForm.svelte';

	const commentToText = $derived(
		$readingState.commentTo ? getTextById($readingState.commentTo) : null
	);

	const isVisible = $derived(
		!!commentToText && !$readingState.composeExpanded
	);

	function handleExpand() {
		expandCompose();
	}
</script>

{#if isVisible}
	<div
		class="mx-4 mb-4 hidden md:block"
		transition:slide={{ duration: 250, easing: cubicOut }}
	>
		<div class="rounded-2xl bg-surface-1 ring-1 ring-surface-3 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
			<ComposeForm
				{commentToText}
				compact={true}
				onExpand={handleExpand}
			/>
		</div>
	</div>
{/if}
