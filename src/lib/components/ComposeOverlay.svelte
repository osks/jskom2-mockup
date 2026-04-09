<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { readingState } from '$lib/stores/reading';
	import { getTextById } from '$lib/data';
	import ComposeForm from './ComposeForm.svelte';

	const commentToText = $derived(
		$readingState.commentTo ? getTextById($readingState.commentTo) : null
	);

	// Mobile only: show for any compose (comment or new text)
	const mobileVisible = $derived(!!commentToText || $readingState.composingNew);
</script>

<!-- Mobile overlay (bottom sheet) -->
{#if mobileVisible}
	<div
		class="fixed inset-x-0 bottom-0 top-12 z-40 flex flex-col md:hidden"
	>
		<div
			class="flex flex-1 flex-col overflow-y-auto rounded-t-3xl bg-surface-1 shadow-[0_-4px_24px_rgba(0,0,0,0.12)]"
			transition:fly={{ y: window.innerHeight, duration: 300, easing: cubicOut }}
		>
			<ComposeForm {commentToText} />
		</div>
	</div>
{/if}
