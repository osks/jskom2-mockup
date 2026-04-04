<script lang="ts">
	import { readingState, advanceReading, setCommentTo, setActiveText } from '$lib/stores/reading';
	import { getTextById, getConferenceById, getUserById } from '$lib/data';
	import StreamMessage from './StreamMessage.svelte';
	import { tick, onMount } from 'svelte';

	let scrollContainer: HTMLElement | undefined = $state();
	let prevBufferLen = $state(0);

	// Touch tracking for swipe-up
	let touchStartY = $state(0);
	let touchStartTime = $state(0);

	// Intersection observer for active text tracking
	let observer: IntersectionObserver | undefined;

	onMount(() => {
		observer = new IntersectionObserver(
			(entries) => {
				// Find the most visible text, or the last one entering the viewport
				let bestEntry: IntersectionObserverEntry | null = null;
				for (const entry of entries) {
					if (entry.isIntersecting) {
						if (!bestEntry || entry.intersectionRatio > bestEntry.intersectionRatio) {
							bestEntry = entry;
						}
					}
				}
				if (bestEntry) {
					const textId = Number((bestEntry.target as HTMLElement).dataset.textId);
					if (textId) setActiveText(textId);
				}
			},
			{
				root: scrollContainer,
				threshold: [0, 0.25, 0.5, 0.75, 1.0]
			}
		);

		return () => observer?.disconnect();
	});

	// Observe new text articles as they appear
	$effect(() => {
		const len = $readingState.buffer.length;
		if (len > 0 && observer && scrollContainer) {
			tick().then(() => {
				if (!scrollContainer || !observer) return;
				const articles = scrollContainer.querySelectorAll('article[data-text-id]');
				// Re-observe all (observer deduplicates)
				for (const el of articles) {
					observer.observe(el);
				}
			});
		}
	});

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
	const activeTextId = $derived($readingState.activeTextId);
	const activeText = $derived(activeTextId ? getTextById(activeTextId) : null);
	const activeAuthor = $derived(activeText ? getUserById(activeText.author) : null);
	const hasTexts = $derived($readingState.buffer.some((b) => b.kind === 'text'));

	function handleComment() {
		if (activeTextId) {
			setCommentTo(activeTextId);
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Scrollable content -->
<div
	bind:this={scrollContainer}
	ontouchstart={handleTouchStart}
	ontouchend={handleTouchEnd}
	class="relative flex-1 overflow-y-auto bg-white"
>
	<!-- Top fade -->
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
					<StreamMessage {text} active={item.textId === activeTextId} />
				{/if}
			{/if}
		{/each}

		{#if nextAction.type === 'all-done' && $readingState.buffer.length === 0}
			<p class="px-4 py-16 text-center text-sm text-gray-400">Inga olästa texter.</p>
		{:else if nextAction.type === 'all-done'}
			<p class="px-4 py-12 text-center text-sm text-gray-400">Klart — du har läst allt.</p>
		{/if}

		<!-- Spacer so last text isn't hidden behind action bar -->
		{#if hasTexts}
			<div class="h-14"></div>
		{/if}
	</div>
</div>

<!-- Sticky action bar -->
{#if hasTexts || nextAction.type !== 'all-done'}
	<div class="shrink-0 flex items-center gap-3 border-t border-gray-100 bg-white px-4 py-2">
		{#if activeText}
			<div class="min-w-0 flex-1">
				<span class="text-xs text-gray-500 truncate block">
					{activeAuthor?.name ?? 'Okänd'} — {activeText.subject}
				</span>
			</div>
			<button
				onclick={handleComment}
				class="shrink-0 rounded px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 active:bg-gray-100"
			>
				kommentera
			</button>
		{:else}
			<div class="flex-1"></div>
		{/if}

		{#if nextAction.type !== 'all-done'}
			<button
				onclick={() => advanceReading()}
				class="shrink-0 rounded bg-gray-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-800 active:bg-gray-700"
			>
				nästa
			</button>
		{/if}
	</div>
{/if}
