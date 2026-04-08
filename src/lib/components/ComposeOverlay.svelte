<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { readingState } from '$lib/stores/reading';
	import { getTextById } from '$lib/data';
	import ComposeForm from './ComposeForm.svelte';

	const commentToText = $derived(
		$readingState.commentTo ? getTextById($readingState.commentTo) : null
	);

	// Mobile: show for any compose (comment or new text)
	const mobileVisible = $derived(!!commentToText || $readingState.composingNew);

	// Desktop: show only for new texts (comments use ComposeBottomBar)
	const desktopVisible = $derived($readingState.composingNew);
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

<!-- Desktop overlay (centered modal, for new texts only) -->
{#if desktopVisible}
	<div
		class="fixed inset-0 z-40 hidden items-center justify-center p-6 md:flex"
	>
		<div
			class="flex w-full max-w-lg max-h-[85vh] flex-col overflow-y-auto rounded-2xl bg-surface-3/40 backdrop-blur-md shadow-[0_0_0_0.5px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.12)] ring-1 ring-surface-1/80"
			transition:fly={{ y: 60, duration: 200, easing: cubicOut }}
		>
			<ComposeForm {commentToText} />
		</div>
	</div>
{/if}
