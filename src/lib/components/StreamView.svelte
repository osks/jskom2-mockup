<script lang="ts">
	import { readingState, advanceReading, setCommentTo, setActiveText, återseText } from '$lib/stores/reading';
	import { getTextById, getConferenceById, getUserById } from '$lib/data';
	import { pageTitle, pageSubtitle } from '$lib/stores/page';
	import StreamMessage from './StreamMessage.svelte';
	import ComposeBottomBar from './ComposeBottomBar.svelte';
	import { Ellipsis, MessageSquare } from 'lucide-svelte';
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

	// Review text input
	let showReviewInput = $state(false);
	let reviewInputValue = $state('');
	let reviewInputEl: HTMLInputElement | undefined = $state();

	function handleReview() {
		const id = parseInt(reviewInputValue.trim(), 10);
		if (!isNaN(id) && id > 0) {
			återseText(id);
			closeReviewInput();
		}
	}

	// Touch tracking for swipe-up
	let touchStartY = $state(0);
	let touchStartTime = $state(0);

	// Throttle flag for scroll-based active text tracking
	let rafPending = false;
	// Suppress scroll-based active tracking during programmatic scrolls
	let suppressScrollTracking = false;

	function updateActiveText() {
		if (!scrollContainer) return;
		const articles = scrollContainer.querySelectorAll('article[data-text-id]');
		if (articles.length === 0) return;

		const containerRect = scrollContainer.getBoundingClientRect();
		const viewportCenter = containerRect.top + containerRect.height / 2;

		let closest: Element | null = null;
		let closestDist = Infinity;

		for (const el of articles) {
			const rect = el.getBoundingClientRect();
			const elCenter = rect.top + rect.height / 2;
			const dist = Math.abs(elCenter - viewportCenter);
			if (dist < closestDist) {
				closestDist = dist;
				closest = el;
			}
		}

		if (closest) {
			const textId = Number((closest as HTMLElement).dataset.textId);
			if (textId) setActiveText(textId);
		}
	}

	function handleScroll() {
		if (rafPending || suppressScrollTracking) return;
		rafPending = true;
		requestAnimationFrame(() => {
			rafPending = false;
			if (!suppressScrollTracking) updateActiveText();
		});
	}

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
			suppressScrollTracking = true;
			tick().then(() => {
				if (scrollContainer) {
					scrollContainer.scrollTo({
						top: scrollContainer.scrollHeight,
						behavior: 'smooth'
					});
				}
				// Re-enable after scroll animation settles
				setTimeout(() => { suppressScrollTracking = false; }, 600);
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

	// The text currently being commented on (for highlighting in stream)
	const commentToId = $derived($readingState.commentTo);

	let moreMenuOpen = $state(false);

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
		scrollToText(nextId);
	}

	function toggleMoreMenu() {
		moreMenuOpen = !moreMenuOpen;
	}

	function closeMoreMenu() {
		moreMenuOpen = false;
	}

	function closeReviewInput() {
		reviewInputEl?.blur();
		showReviewInput = false;
		reviewInputValue = '';
	}

	function scrollToText(textId: number) {
		if (!scrollContainer) return;
		const el = scrollContainer.querySelector(`article[data-text-id="${textId}"]`);
		if (!el) return;
		suppressScrollTracking = true;
		el.scrollIntoView({ behavior: 'smooth', block: 'center' });
		setTimeout(() => { suppressScrollTracking = false; }, 600);
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Scrollable content -->
<div
	bind:this={scrollContainer}
	ontouchstart={handleTouchStart}
	ontouchend={handleTouchEnd}
	onscroll={handleScroll}
	class="relative flex-1 overflow-y-auto overflow-x-hidden overscroll-none pt-below-header max-md:[mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.05),rgba(0,0,0,0.4)_calc(env(safe-area-inset-top,0px)+3.5rem),black_calc(env(safe-area-inset-top,0px)+4.125rem))] max-md:[-webkit-mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.05),rgba(0,0,0,0.4)_calc(env(safe-area-inset-top,0px)+3.5rem),black_calc(env(safe-area-inset-top,0px)+4.125rem))]"
>
	<div class="mx-auto flex max-w-3xl min-h-full flex-col pt-2 md:pt-0">
		<!-- Top spacer so first text can sit near bottom of viewport -->
		<div class="min-h-[60vh] shrink-0"></div>
		{#each $readingState.buffer as item, i}
			{#if item.kind === 'text' && item.textId}
				{@const text = getTextById(item.textId)}
				{#if text}
					{#if $readingState.buffer.slice(0, i).some(b => b.kind === 'text')}
						<div class="mx-8 border-t border-surface-3"></div>
					{/if}
					<StreamMessage {text} active={item.textId === activeTextId} commentTarget={item.textId === commentToId} />
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
<ComposeBottomBar onScrollToText={scrollToText} />

<!-- Floating action bar (hidden when compose panel is open) -->
{#if hasTexts || nextAction.type !== 'all-done'}
	{@const composing = !!$readingState.commentTo || $readingState.composingNew}
	<div class="pointer-events-none fixed left-0 right-0 bottom-0 z-20 flex items-end justify-center px-4 md:left-80 transition-opacity duration-200" style="padding-bottom: max(env(safe-area-inset-bottom, 0px) + 0.5rem, 1.25rem);"
		class:opacity-0={composing}
	>
		<div class="flex w-full max-w-3xl items-center gap-2.5"
			class:pointer-events-auto={!composing}
			class:pointer-events-none={composing}
		>
			<!-- Secondary actions pill -->
			{#if activeText}
				<div class="relative">
					<div class="flex h-12 items-center rounded-full bg-surface-4/70 backdrop-blur-md ring-[1.5px] ring-surface-1/80 shadow-[0_0_0_0.5px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.08)]">
						<button
							onclick={handleComment}
							class="flex h-12 items-center justify-center rounded-l-full pl-5 pr-5 active:bg-surface-4/50"
							aria-label="Kommentera"
						>
							<MessageSquare size={18} class="text-txt" />
						</button>
						<div class="h-5 w-px bg-txt-muted/30"></div>
						<button
							onclick={toggleMoreMenu}
							class="flex h-12 items-center justify-center rounded-r-full pl-5 pr-5 active:bg-surface-4/50"
							aria-label="Fler åtgärder"
						>
							<Ellipsis size={18} class="text-txt" />
						</button>
					</div>

					<!-- More menu popover -->
					{#if moreMenuOpen}
						<!-- Backdrop -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div class="fixed inset-0 z-30" onclick={closeMoreMenu}></div>
						<div class="absolute bottom-full left-0 z-40 mb-2 min-w-48 rounded-2xl bg-white px-1.5 py-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border-[0.5px] border-surface-5">
							<button onclick={() => { closeMoreMenu(); showReviewInput = true; tick().then(() => reviewInputEl?.focus()); }} class="flex w-full items-center rounded-lg px-2.5 py-2.5 text-sm text-txt-secondary hover:bg-surface-2 active:bg-surface-3">
								Återse text
							</button>
							<div class="mx-3 my-1 border-t border-surface-2"></div>
							<button onclick={() => { closeMoreMenu(); }} class="flex w-full items-center rounded-lg px-2.5 py-2.5 text-sm text-txt-secondary hover:bg-surface-2 active:bg-surface-3">
								Markera text
							</button>
							<button onclick={() => { closeMoreMenu(); }} class="flex w-full items-center rounded-lg px-2.5 py-2.5 text-sm text-txt-secondary hover:bg-surface-2 active:bg-surface-3">
								Avmarkera text
							</button>
							<div class="mx-3 my-1 border-t border-surface-2"></div>
							<button onclick={() => { closeMoreMenu(); }} class="flex w-full items-center rounded-lg px-2.5 py-2.5 text-sm text-txt-secondary hover:bg-surface-2 active:bg-surface-3">
								Markera som läst
							</button>
							<button onclick={() => { closeMoreMenu(); }} class="flex w-full items-center rounded-lg px-2.5 py-2.5 text-sm text-txt-secondary hover:bg-surface-2 active:bg-surface-3">
								Markera som oläst
							</button>
						</div>
					{/if}
				</div>
			{/if}

			<div class="flex-1"></div>

			<!-- Next button -->
			{#if nextAction.type !== 'all-done'}
				<button
					onclick={() => advanceReading()}
					class="flex h-12 items-center justify-center rounded-full bg-primary hover:bg-primary-hover backdrop-blur-md px-5 ring-[1.5px] ring-surface-1/25 active:bg-primary-active transition-colors"
					aria-label="Nästa olästa"
				>
					<span class="text-sm font-medium text-txt-inverse">Nästa</span>
				</button>
			{/if}
		</div>
	</div>
{/if}

<!-- Återse text dialog (separate from floating bar to avoid keyboard layout issues) -->
{#if showReviewInput}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/20" onclick={closeReviewInput}>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="mx-6 w-full max-w-xs rounded-2xl bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border-[0.5px] border-surface-5" onclick={(e) => e.stopPropagation()}>
			<div class="text-sm font-medium text-txt-secondary mb-3">Återse text</div>
			<form onsubmit={(e) => { e.preventDefault(); handleReview(); }} class="flex items-center gap-2">
				<input
					bind:this={reviewInputEl}
					bind:value={reviewInputValue}
					type="number"
					placeholder="Textnummer"
					class="w-full rounded-xl bg-surface-2 px-4 py-2.5 text-base ring-1 ring-surface-3 focus:outline-none focus:ring-1 focus:ring-primary"
				/>
				<button
					type="submit"
					disabled={!reviewInputValue.trim()}
					class="shrink-0 rounded-xl bg-primary hover:bg-primary-hover px-4 py-2.5 text-sm font-medium text-txt-inverse active:bg-primary-active disabled:opacity-30 transition-colors"
				>Visa</button>
			</form>
		</div>
	</div>
{/if}
