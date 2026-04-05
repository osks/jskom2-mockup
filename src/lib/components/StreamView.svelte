<script lang="ts">
	import { readingState, advanceReading, setCommentTo, setActiveText } from '$lib/stores/reading';
	import { getTextById, getConferenceById, getUserById } from '$lib/data';
	import { pageTitle } from '$lib/stores/page';
	import StreamMessage from './StreamMessage.svelte';
	import { ChevronRight, Ellipsis } from 'lucide-svelte';
	import { tick } from 'svelte';

	// Set mobile header title based on current conference + unread count
	$effect(() => {
		const confId = $readingState.currentConference;
		if (confId) {
			const conf = getConferenceById(confId);
			const name = conf?.name ?? 'Läsa';
			// Count remaining unread texts in the reading list for this conference
			const remaining = $readingState.readingList.reduce(
				(sum, entry) => sum + entry.textIds.length, 0
			);
			if (remaining > 0) {
				pageTitle.set(`${name} · ${remaining} olästa`);
			} else {
				pageTitle.set(name);
			}
		} else {
			pageTitle.set('Läsa');
		}
	});

	let scrollContainer: HTMLElement | undefined = $state();
	let prevBufferLen = $state(0);

	// Touch tracking for swipe-up
	let touchStartY = $state(0);
	let touchStartTime = $state(0);

	// Throttle flag for scroll-based active text tracking
	let rafPending = false;

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
		if (rafPending) return;
		rafPending = true;
		requestAnimationFrame(() => {
			rafPending = false;
			updateActiveText();
		});
	}

	// Auto-scroll to bottom when new items are added, then update active
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
				// Update active after scroll settles
				setTimeout(updateActiveText, 350);
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

	let moreMenuOpen = $state(false);

	function handleComment() {
		if (activeTextId) {
			setCommentTo(activeTextId);
		}
	}

	function toggleMoreMenu() {
		moreMenuOpen = !moreMenuOpen;
	}

	function closeMoreMenu() {
		moreMenuOpen = false;
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Scrollable content -->
<div
	bind:this={scrollContainer}
	ontouchstart={handleTouchStart}
	ontouchend={handleTouchEnd}
	onscroll={handleScroll}
	class="relative flex-1 overflow-y-auto overflow-x-hidden overscroll-none bg-gray-50"
>
	<!-- Top fade -->
	<div class="pointer-events-none sticky top-0 z-10 h-6 bg-gradient-to-b from-gray-50 to-transparent"></div>

	<div class="mx-auto flex max-w-2xl min-h-full flex-col pt-2 md:pt-0">
		<!-- Top spacer so first text can sit near bottom of viewport -->
		<div class="min-h-[60vh] shrink-0"></div>
		{#each $readingState.buffer as item, i}
			{#if item.kind === 'conference-enter'}
				{@const conf = item.conferenceId ? getConferenceById(item.conferenceId) : null}
				{#if conf}
					<div
						id="conference-{item.conferenceId}"
						class="hidden md:sticky md:block top-0 z-10 bg-white/95 backdrop-blur-sm px-4 py-2 border-b border-gray-100"
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
					{#if $readingState.buffer.slice(0, i).some(b => b.kind === 'text')}
						<div class="mx-8 border-t border-gray-200"></div>
					{/if}
					<StreamMessage {text} active={item.textId === activeTextId} />
				{/if}
			{/if}
		{/each}

		{#if nextAction.type === 'all-done' && $readingState.buffer.length === 0}
			<p class="px-4 py-16 text-center text-sm text-gray-400">Inga olästa texter.</p>
		{:else if nextAction.type === 'all-done'}
			<p class="px-4 py-12 text-center text-sm text-gray-400">Klart — du har läst allt.</p>
		{/if}

		<!-- Spacer so last text isn't hidden behind floating bar -->
		{#if hasTexts}
			<div class="h-20"></div>
		{/if}
	</div>
</div>

<!-- Floating action bar -->
{#if hasTexts || nextAction.type !== 'all-done'}
	<div class="safe-bottom pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-center px-6 pb-5">
		<div class="pointer-events-auto flex w-full max-w-md items-center gap-2.5">
			<!-- More actions -->
			{#if activeText}
				<div class="relative">
					<button
						onclick={toggleMoreMenu}
						class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200/55 backdrop-blur-md ring-1 ring-white shadow-[0_0_0_0.5px_rgba(0,0,0,0.06)] active:bg-gray-300/50"
						aria-label="Fler åtgärder"
					>
						<Ellipsis size={20} class="text-gray-500" />
					</button>

					<!-- More menu popover -->
					{#if moreMenuOpen}
						<!-- Backdrop -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div class="fixed inset-0 z-30" onclick={closeMoreMenu}></div>
						<div class="absolute bottom-full left-0 z-40 mb-2 min-w-44 rounded-xl bg-white py-1.5 shadow-lg ring-1 ring-gray-200/60">
							<button onclick={() => { closeMoreMenu(); }} class="flex w-full items-center px-4 py-2.5 text-sm text-gray-700 active:bg-gray-100">
								Markera text
							</button>
							<button onclick={() => { closeMoreMenu(); }} class="flex w-full items-center px-4 py-2.5 text-sm text-gray-700 active:bg-gray-100">
								Avmarkera text
							</button>
							<div class="mx-3 my-1 border-t border-gray-100"></div>
							<button onclick={() => { closeMoreMenu(); }} class="flex w-full items-center px-4 py-2.5 text-sm text-gray-700 active:bg-gray-100">
								Markera som läst
							</button>
							<button onclick={() => { closeMoreMenu(); }} class="flex w-full items-center px-4 py-2.5 text-sm text-gray-700 active:bg-gray-100">
								Markera som oläst
							</button>
						</div>
					{/if}
				</div>
			{/if}

			<!-- Comment input pill -->
			{#if activeText}
				<button
					onclick={handleComment}
					class="flex h-12 min-w-0 flex-1 items-center rounded-full bg-gray-200/55 backdrop-blur-md ring-1 ring-white shadow-[0_0_0_0.5px_rgba(0,0,0,0.06)] px-4 active:bg-gray-300/50"
				>
					<span class="truncate text-sm text-gray-400">Kommentera...</span>
				</button>
			{:else}
				<div class="flex-1"></div>
			{/if}

			<!-- Next button -->
			{#if nextAction.type !== 'all-done'}
				<button
					onclick={() => advanceReading()}
					class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-900/80 backdrop-blur-md ring-1 ring-white/25 active:bg-gray-700"
					aria-label="Nästa olästa"
				>
					<ChevronRight size={24} class="text-white" />
				</button>
			{/if}
		</div>
	</div>
{/if}
