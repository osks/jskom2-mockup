<script lang="ts">
	import { readingState, advanceReading } from '$lib/stores/reading';
	import { getTextById, getConferenceById } from '$lib/data';
	import StreamMessage from './StreamMessage.svelte';
	import { tick } from 'svelte';
	import { ChevronDown, MessageSquare, ArrowRight, CheckCircle } from 'lucide-svelte';

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

	function handleNext() {
		advanceReading();
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

		// Swipe up: at least 60px, within 400ms, and at bottom of scroll
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
	class="flex-1 overflow-y-auto"
>
	<div class="mx-auto max-w-3xl">
		{#each $readingState.buffer as item, i}
			{#if item.kind === 'conference-enter'}
				{@const conf = item.conferenceId ? getConferenceById(item.conferenceId) : null}
				<div
					id="conference-{item.conferenceId}"
					class="sticky top-0 z-10 flex items-center gap-3 bg-gray-50/95 backdrop-blur-sm px-4 py-2.5"
				>
					<div class="h-px flex-1 bg-gray-200"></div>
					{#if conf}
						<div class="flex items-center gap-2">
							<span class="text-xs font-semibold uppercase tracking-wider text-gray-500">
								{conf.name}
							</span>
							{#if item.conferenceUnread && item.conferenceUnread > 0}
								<span class="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-lyskom-600 px-1.5 text-[10px] font-bold text-white">
									{item.conferenceUnread}
								</span>
							{/if}
						</div>
					{/if}
					<div class="h-px flex-1 bg-gray-200"></div>
				</div>
			{:else if item.kind === 'text' && item.textId}
				{@const text = getTextById(item.textId)}
				{#if text}
					<StreamMessage {text} />
				{/if}
			{/if}
		{/each}

		<!-- Next action prompt -->
		<div class="px-4 py-6">
			{#if nextAction.type === 'all-done' && $readingState.buffer.length === 0}
				<div class="flex flex-col items-center gap-3 py-12 text-center">
					<div class="rounded-full bg-gray-100 p-3">
						<MessageSquare size={24} class="text-gray-400" />
					</div>
					<p class="text-sm font-medium text-gray-600">Inga olästa texter</p>
					<p class="text-xs text-gray-400">Du har läst allt. Väntar på nya texter...</p>
				</div>
			{:else if nextAction.type === 'all-done'}
				<div class="flex flex-col items-center gap-2 py-8">
					<CheckCircle size={20} class="text-green-500" />
					<p class="text-sm font-medium text-gray-600">Klart! Du har läst allt.</p>
				</div>
			{:else}
				<button
					onclick={handleNext}
					class="group flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-3.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-lyskom-300 hover:bg-lyskom-50 hover:text-lyskom-700 hover:shadow-md active:scale-[0.98] active:bg-lyskom-50"
				>
					{#if nextAction.type === 'next-comment'}
						<MessageSquare size={16} class="text-lyskom-500" />
						<span>{nextAction.label}</span>
					{:else if nextAction.type === 'next-conf'}
						<ArrowRight size={16} class="text-lyskom-500" />
						<span>{nextAction.label}</span>
						<span class="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500 group-hover:bg-lyskom-100 group-hover:text-lyskom-600 group-active:bg-lyskom-100 group-active:text-lyskom-600">
							{nextAction.conferenceName}
						</span>
					{:else}
						<ChevronDown size={16} class="text-lyskom-500" />
						<span>{nextAction.label}</span>
					{/if}
					<!-- Desktop: show keyboard shortcut. Mobile: show swipe hint -->
					<kbd class="ml-2 hidden rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] text-gray-400 group-hover:border-lyskom-200 group-hover:bg-lyskom-50 md:inline-block">
						SPC
					</kbd>
					<span class="ml-1 text-[10px] text-gray-400 md:hidden">
						svep upp
					</span>
				</button>
			{/if}
		</div>
	</div>
</div>
