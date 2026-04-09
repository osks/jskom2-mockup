<script lang="ts">
	import { readingState } from '$lib/stores/reading';
	import { getTextById } from '$lib/data';
	import StreamMessage from './StreamMessage.svelte';
	import ComposeForm from './ComposeForm.svelte';

	interface Props {
		onCollapse: () => void;
	}

	let { onCollapse }: Props = $props();

	const commentToText = $derived(
		$readingState.commentTo ? getTextById($readingState.commentTo) : null
	);

	const INITIAL_SPLIT = 50;
	const MIN_SPLIT = 20;
	const MAX_SPLIT = 70;

	let splitPercent = $state(INITIAL_SPLIT);
	let containerEl: HTMLDivElement | undefined = $state();
	let dragging = $state(false);

	function handlePointerDown(e: PointerEvent) {
		const target = e.currentTarget as HTMLElement;
		target.setPointerCapture(e.pointerId);
		dragging = true;
	}

	function handlePointerMove(e: PointerEvent) {
		if (!dragging || !containerEl) return;
		const rect = containerEl.getBoundingClientRect();
		const y = e.clientY - rect.top;
		const percent = (y / rect.height) * 100;
		splitPercent = Math.min(Math.max(percent, MIN_SPLIT), MAX_SPLIT);
	}

	function handlePointerUp(e: PointerEvent) {
		dragging = false;
	}
</script>

<div
	bind:this={containerEl}
	class="hidden md:flex flex-1 flex-col min-h-0"
>
	{#if commentToText}
		<!-- Top panel: parent text -->
		<div
			class="flex justify-center"
			style="height: {splitPercent}%"
		>
			<div class="w-full max-w-3xl overflow-y-auto px-4 pt-4">
				<StreamMessage text={commentToText} commentTarget={true} />
			</div>
		</div>

		<!-- Draggable divider -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="flex-none flex justify-center h-3 cursor-row-resize group"
			onpointerdown={handlePointerDown}
			onpointermove={handlePointerMove}
			onpointerup={handlePointerUp}
		>
			<div class="w-full max-w-3xl flex items-center justify-center border-t border-edge h-full">
				<div class="w-12 h-1 rounded-full bg-surface-5 group-hover:bg-txt-muted transition-colors"></div>
			</div>
		</div>

		<!-- Bottom panel: compose form -->
		<div
			class="overflow-y-auto flex flex-col"
			style="height: {100 - splitPercent}%"
		>
			<div class="mx-auto w-full max-w-3xl flex-1 flex flex-col">
				<ComposeForm
					{commentToText}
					variant="bottombar"
					onCollapse={onCollapse}
				/>
			</div>
		</div>
	{:else}
		<!-- New text: natural-height compose -->
		<div class="flex-1 overflow-y-auto">
			<div class="mx-auto w-full max-w-3xl pt-4">
				<ComposeForm
					commentToText={null}
					variant="bottombar"
					onCollapse={onCollapse}
				/>
			</div>
		</div>
	{/if}
</div>
