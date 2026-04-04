<script lang="ts">
	import { readingState, advanceReading } from '$lib/stores/reading';
	import { getTextById, getConferenceById } from '$lib/data';
	import StreamMessage from './StreamMessage.svelte';
	import { tick } from 'svelte';
	import { ChevronDown, ArrowRight, MessageSquare } from 'lucide-svelte';

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

<!-- Scrollable content -->
<div
	bind:this={scrollContainer}
	ontouchstart={handleTouchStart}
	ontouchend={handleTouchEnd}
	class="relative flex-1 overflow-y-auto bg-white"
>
	<!-- Top fade/blur overlay -->
	<div class="pointer-events-none sticky top-0 z-10 h-12 bg-gradient-to-b from-white via-white/80 to-transparent md:h-6"></div>

	<div class="mx-auto flex max-w-2xl min-h-full flex-col justify-end pt-2 md:pt-0">
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

		<!-- Bottom padding so content doesn't hide behind FAB -->
		{#if nextAction.type === 'all-done' && $readingState.buffer.length === 0}
			<p class="px-4 py-16 text-center text-sm text-gray-400">Inga olästa texter.</p>
		{:else if nextAction.type === 'all-done'}
			<p class="px-4 py-12 text-center text-sm text-gray-400">Klart — du har läst allt.</p>
		{:else}
			<div class="h-20"></div>
		{/if}
	</div>
</div>

<!-- M3 Regular FAB for next action -->
{#if nextAction.type !== 'all-done'}
	<button
		onclick={() => advanceReading()}
		class="fixed bottom-4 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-2xl bg-lyskom-100 text-lyskom-700 shadow-md transition-shadow hover:shadow-lg active:scale-[0.97]"
		title={nextAction.type === 'next-comment' ? 'Nästa kommentar' : nextAction.type === 'next-conf' ? nextAction.conferenceName : 'Nästa text'}
	>
		{#if nextAction.type === 'next-comment'}
			<MessageSquare size={24} />
		{:else if nextAction.type === 'next-conf'}
			<ArrowRight size={24} />
		{:else}
			<ChevronDown size={24} />
		{/if}
	</button>
{/if}
