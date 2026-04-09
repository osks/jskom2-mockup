<script lang="ts">
	import { readingState, advanceReading, setCommentTo, setActiveText, clearCommentTo, cancelCompose } from '$lib/stores/reading';
	import { getTextById, getConferenceById } from '$lib/data';
	import { pageTitle, pageSubtitle } from '$lib/stores/page';
	import StreamMessage from './StreamMessage.svelte';
	import ComposeBottomBar from './ComposeBottomBar.svelte';
	import ComposeExpandedView from './ComposeExpandedView.svelte';
	import ReadingActionBar from './ReadingActionBar.svelte';
	import { tick } from 'svelte';

	// Set mobile header title based on current conference + unread count
	$effect(() => {
		const confId = $readingState.currentConference;
		if (confId) {
			const conf = getConferenceById(confId);
			pageTitle.set(conf?.name ?? 'Läsa');
			const remaining = $readingState.readingList.reduce(
				(sum, entry) => sum + entry.textIds.length, 0
			);
			pageSubtitle.set(remaining > 0 ? `${remaining} olästa` : '');
		} else {
			pageTitle.set('Läsa');
			pageSubtitle.set('');
		}
	});

	let scrollContainer: HTMLElement | undefined = $state();
	let prevBufferLen = $state(0);

	// Touch tracking for swipe-up
	let touchStartY = $state(0);
	let touchStartTime = $state(0);


	// Auto-scroll to bottom when new items are added, and set the new text as active
	$effect(() => {
		const len = $readingState.buffer.length;
		if (len > prevBufferLen && scrollContainer) {
			prevBufferLen = len;

			// Immediately set the newest text as active
			const lastItem = $readingState.buffer[len - 1];
			if (lastItem?.kind === 'text' && lastItem.textId) {
				setActiveText(lastItem.textId);
			}

			// Suppress scroll-based tracking during programmatic scroll
			tick().then(() => {
				if (scrollContainer) {
					scrollContainer.scrollTo({
						top: scrollContainer.scrollHeight,
						behavior: 'smooth'
					});
				}
				// Re-enable after scroll animation settles
			});
		}
	});

	function isAtBottom(): boolean {
		if (!scrollContainer) return true;
		const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
		return scrollHeight - scrollTop - clientHeight < 50;
	}

	function handleKeydown(e: KeyboardEvent) {
		const target = e.target as HTMLElement;
		const inInput = target.tagName === 'TEXTAREA' || target.tagName === 'INPUT';

		if (e.key === ' ' && !e.ctrlKey && !e.metaKey && !e.altKey && !inInput) {
			e.preventDefault();
			if (!isAtBottom() && scrollContainer) {
				scrollContainer.scrollBy({ top: scrollContainer.clientHeight - 60, behavior: 'smooth' });
				return;
			}
			advanceReading();
		}

		// Arrow keys to move active text
		if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && !inInput && !e.ctrlKey && !e.metaKey) {
			e.preventDefault();
			moveActive(e.key === 'ArrowUp' ? -1 : 1);
		}

		// "k" to start commenting on active text
		if (e.key === 'k' && !inInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
			const composing = !!$readingState.commentTo || $readingState.composingNew;
			if (!composing) {
				handleComment();
			}
		}

		// Escape to cancel composing (works even when textarea is not focused)
		if (e.key === 'Escape' && !inInput) {
			const composing = !!$readingState.commentTo || $readingState.composingNew;
			if (composing) {
				clearCommentTo();
				cancelCompose();
			}
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
	const hasTexts = $derived($readingState.buffer.some((b) => b.kind === 'text'));

	// The text currently being commented on (for highlighting in stream)
	const commentToId = $derived($readingState.commentTo);
	const commentToText = $derived(commentToId ? getTextById(commentToId) : null);

	// Focus mode: replaces the stream with a split view (parent text + compose)
	let expanded = $state(false);

	// Reset focus mode when compose closes
	$effect(() => {
		if (!$readingState.commentTo) {
			expanded = false;
		}
	});

	// When compose opens, scroll the target text so its bottom is visible above the compose bar
	let prevCommentTo: number | null = null;
	$effect(() => {
		const textId = $readingState.commentTo;
		if (textId === prevCommentTo) return;
		prevCommentTo = textId;
		if (!textId || !scrollContainer) return;
		// Wait for the compose bar to render and measure
		tick().then(() => {
			setTimeout(() => {
				if (!scrollContainer) return;
				const el = scrollContainer.querySelector(`article[data-text-id="${textId}"]`);
				if (!el) return;
				const elRect = el.getBoundingClientRect();
				const containerRect = scrollContainer.getBoundingClientRect();
				const targetBottom = containerRect.bottom - 8;
				const offset = elRect.bottom - targetBottom;
				if (offset > 0) {
							scrollContainer.scrollBy({ top: offset, behavior: 'smooth' });
					}
			}, 250);
		});
	});

	// Ordered list of text IDs in the buffer
	const textIds = $derived(
		$readingState.buffer
			.filter((b): b is typeof b & { textId: number } => b.kind === 'text' && !!b.textId)
			.map((b) => b.textId)
	);

	function handleComment() {
		if (activeTextId) {
			setCommentTo(activeTextId);
		}
	}

	function moveActive(direction: -1 | 1) {
		if (textIds.length === 0) return;
		const currentIdx = activeTextId ? textIds.indexOf(activeTextId) : -1;
		let nextIdx: number;
		if (currentIdx === -1) {
			nextIdx = direction === 1 ? 0 : textIds.length - 1;
		} else {
			nextIdx = currentIdx + direction;
			if (nextIdx < 0 || nextIdx >= textIds.length) return;
		}
		const nextId = textIds[nextIdx];
		setActiveText(nextId);
		scrollToTextIfNeeded(nextId);
	}

	function scrollToText(textId: number) {
		if (!scrollContainer) return;
		const el = scrollContainer.querySelector(`article[data-text-id="${textId}"]`);
		if (!el) return;
		el.scrollIntoView({ behavior: 'smooth', block: 'center' });
	}

	function scrollToTextIfNeeded(textId: number) {
		if (!scrollContainer) return;
		const el = scrollContainer.querySelector(`article[data-text-id="${textId}"]`);
		if (!el) return;
		const containerRect = scrollContainer.getBoundingClientRect();
		const elRect = el.getBoundingClientRect();
		// Check if element is fully visible within the scroll container
		// Leave 80px margin for floating bar at bottom
		if (elRect.top >= containerRect.top && elRect.bottom <= containerRect.bottom - 80) return;
		el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if expanded && commentToText}
	<ComposeExpandedView {commentToText} onCollapse={() => expanded = false} />
{:else}
<!-- Scrollable content -->
<div
	bind:this={scrollContainer}
	ontouchstart={handleTouchStart}
	ontouchend={handleTouchEnd}
	class="relative flex-1 overflow-y-auto overflow-x-hidden overscroll-none pt-below-header max-md:[mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.05),rgba(0,0,0,0.4)_calc(env(safe-area-inset-top,0px)+3.5rem),black_calc(env(safe-area-inset-top,0px)+4.125rem))] max-md:[-webkit-mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.05),rgba(0,0,0,0.4)_calc(env(safe-area-inset-top,0px)+3.5rem),black_calc(env(safe-area-inset-top,0px)+4.125rem))]"
>
	<div class="mx-auto flex max-w-3xl min-h-full flex-col pt-2 md:pt-0">
		<!-- Top spacer: pushes content to the bottom of the viewport -->
		<div class="flex-1"></div>
		{#each $readingState.buffer as item, i}
			{#if item.kind === 'text' && item.textId}
				{@const text = getTextById(item.textId)}
				{@const isTarget = item.textId === commentToId}
				{#if text}
					{#if $readingState.buffer.slice(0, i).some(b => b.kind === 'text')}
						<div class="mx-8 border-t border-surface-4 transition-opacity duration-300" class:md:opacity-30={!!commentToId && !isTarget}></div>
					{/if}
					<div class="transition-opacity duration-300" class:md:opacity-30={!!commentToId && !isTarget}>
						<StreamMessage {text} active={item.textId === activeTextId} commentTarget={isTarget} />
					</div>
				{/if}
			{/if}
		{/each}

		{#if nextAction.type === 'all-done' && $readingState.buffer.length === 0}
			<p class="px-4 py-16 text-center text-sm text-txt-muted">Inga olästa texter.</p>
		{:else if nextAction.type === 'all-done'}
			<p class="px-4 py-12 text-center text-sm text-txt-muted">Klart — du har läst allt.</p>
		{/if}

		<!-- Spacer so last text isn't hidden behind floating bar -->
		{#if hasTexts}
			<div class="h-20"></div>
		{/if}
	</div>
</div>

<!-- Desktop bottom compose bar (within flex layout, pushes scroll area up) -->
<ComposeBottomBar onScrollToText={scrollToText} onExpand={() => expanded = true} />
{/if}

<ReadingActionBar />
