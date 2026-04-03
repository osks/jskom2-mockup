<script lang="ts">
	import { readingState, advanceReading } from '$lib/stores/reading';
	import { getTextById, getConferenceById } from '$lib/data';
	import StreamMessage from './StreamMessage.svelte';
	import { tick } from 'svelte';

	let scrollContainer: HTMLElement | undefined = $state();
	let prevBufferLen = $state(0);

	// Touch tracking for swipe-up
	let touchStartY = $state(0);
	let touchStartTime = $state(0);

	// Auto-scroll to bottom when new items are added
	$effect(() => {
		const len = $readingState.buffer.length;
		if (len > prevBufferLen && scrollContainer) {
			prevBufferLen = len;
			tick().then(() => {
				if (scrollContainer) {
					scrollContainer.scrollTo({
						top: scrollContainer.scrollHeight,
						behavior: 'smooth'
					});
				}
			});
		}
	});

	function isAtBottom(): boolean {
		if (!scrollContainer) return true;
		const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
		return scrollHeight - scrollTop - clientHeight < 50;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === ' ' && !e.ctrlKey && !e.metaKey && !e.altKey) {
			const target = e.target as HTMLElement;
			if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') return;

			e.preventDefault();
			if (!isAtBottom() && scrollContainer) {
				scrollContainer.scrollBy({ top: scrollContainer.clientHeight - 60, behavior: 'smooth' });
				return;
			}
			advanceReading();
		}
	}

	function handleTouchStart(e: TouchEvent) {
		touchStartY = e.touches[0].clientY;
		touchStartTime = Date.now();
	}

	function handleTouchEnd(e: TouchEvent) {
		const touchEndY = e.changedTouches[0].clientY;
		const deltaY = touchStartY - touchEndY;
		const elapsed = Date.now() - touchStartTime;

		if (deltaY > 60 && elapsed < 400 && isAtBottom()) {
			advanceReading();
		}
	}

	const nextAction = $derived($readingState.nextAction);
</script>

<svelte:window onkeydown={handleKeydown} />

<div
	bind:this={scrollContainer}
	ontouchstart={handleTouchStart}
	ontouchend={handleTouchEnd}
	class="flex-1 overflow-y-auto bg-white"
>
	<div class="mx-auto max-w-2xl">
		{#each $readingState.buffer as item, i}
			{#if item.kind === 'conference-enter'}
				{@const conf = item.conferenceId ? getConferenceById(item.conferenceId) : null}
				{#if conf}
					<div
						id="conference-{item.conferenceId}"
						class="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-4 py-2 border-b border-gray-100"
					>
						<span class="text-xs font-medium text-gray-500">
							{conf.name}
						</span>
						{#if item.conferenceUnread && item.conferenceUnread > 0}
							<span class="ml-1.5 text-xs text-gray-400">
								{item.conferenceUnread} olästa
							</span>
						{/if}
					</div>
				{/if}
			{:else if item.kind === 'text' && item.textId}
				{@const text = getTextById(item.textId)}
				{#if text}
					<StreamMessage {text} />
				{/if}
			{/if}
		{/each}

		<!-- Next action prompt -->
		<div class="px-4 py-8">
			{#if nextAction.type === 'all-done' && $readingState.buffer.length === 0}
				<p class="text-center text-sm text-gray-400">Inga olästa texter.</p>
			{:else if nextAction.type === 'all-done'}
				<p class="text-center text-sm text-gray-400">Klart — du har läst allt.</p>
			{:else}
				<button
					onclick={() => advanceReading()}
					class="flex w-full items-center justify-center gap-2 rounded-md py-2.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 active:bg-gray-100 transition-colors"
				>
					<span>{nextAction.label}</span>
					{#if nextAction.type === 'next-conf'}
						<span class="text-gray-400">— {nextAction.conferenceName}</span>
					{/if}
					<kbd class="ml-1 hidden rounded border border-gray-200 px-1 py-px text-[10px] text-gray-300 md:inline">
						space
					</kbd>
				</button>
			{/if}
		</div>
	</div>
</div>
