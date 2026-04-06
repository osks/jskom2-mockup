<script lang="ts">
	import { readingState, advanceReading, setCommentTo, setActiveText, återseText } from '$lib/stores/reading';
	import { getTextById, getConferenceById, getUserById } from '$lib/data';
	import { pageTitle, pageSubtitle } from '$lib/stores/page';
	import StreamMessage from './StreamMessage.svelte';
	import { ChevronRight, Ellipsis, MessageSquare } from 'lucide-svelte';
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

	// Återse text input
	let showÅterseInput = $state(false);
	let återseInputValue = $state('');
	let återseInputEl: HTMLInputElement | undefined = $state();

	function handleÅterse() {
		const id = parseInt(återseInputValue.trim(), 10);
		if (!isNaN(id) && id > 0) {
			återseText(id);
			återseInputValue = '';
			showÅterseInput = false;
			closeMoreMenu();
		}
	}

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
		showÅterseInput = false;
		återseInputValue = '';
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Scrollable content -->
<div
	bind:this={scrollContainer}
	ontouchstart={handleTouchStart}
	ontouchend={handleTouchEnd}
	onscroll={handleScroll}
	class="relative flex-1 overflow-y-auto overflow-x-hidden overscroll-none pt-below-header"
	style="mask-image: linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.4) calc(env(safe-area-inset-top, 0px) + 3.5rem), black calc(env(safe-area-inset-top, 0px) + 4.125rem)); -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.4) calc(env(safe-area-inset-top, 0px) + 3.5rem), black calc(env(safe-area-inset-top, 0px) + 4.125rem));"
>
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

<!-- Floating action bar (hidden when compose panel is open) -->
{#if hasTexts || nextAction.type !== 'all-done'}
	{@const composing = !!$readingState.commentTo || $readingState.composingNew}
	<div class="safe-bottom pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-center px-6 pb-5 transition-opacity duration-200"
		class:opacity-0={composing}
	>
		<div class="flex w-full max-w-md items-center gap-2.5"
			class:pointer-events-auto={!composing}
			class:pointer-events-none={composing}
		>
			<!-- Secondary actions pill -->
			{#if activeText}
				<div class="relative">
					<div class="flex h-12 items-center rounded-full bg-gray-200/70 backdrop-blur-md ring-[1.5px] ring-white/80 shadow-[0_0_0_0.5px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.08)]">
						<button
							onclick={handleComment}
							class="flex h-12 items-center justify-center rounded-l-full pl-5 pr-5 active:bg-gray-300/50"
							aria-label="Kommentera"
						>
							<MessageSquare size={18} class="text-gray-800" />
						</button>
						<div class="h-5 w-px bg-gray-400/30"></div>
						<button
							onclick={toggleMoreMenu}
							class="flex h-12 items-center justify-center rounded-r-full pl-5 pr-5 active:bg-gray-300/50"
							aria-label="Fler åtgärder"
						>
							<Ellipsis size={18} class="text-gray-800" />
						</button>
					</div>

					<!-- More menu popover -->
					{#if moreMenuOpen}
						<!-- Backdrop -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div class="fixed inset-0 z-30" onclick={closeMoreMenu}></div>
						<div class="absolute bottom-full left-0 z-40 mb-2 min-w-48 rounded-xl bg-white py-1.5 shadow-lg ring-1 ring-gray-200/60">
							{#if showÅterseInput}
								<div class="px-3 py-2">
									<div class="text-xs font-medium text-gray-500 mb-1.5">Textnummer</div>
									<form onsubmit={(e) => { e.preventDefault(); handleÅterse(); }} class="flex items-center gap-2">
										<input
											bind:this={återseInputEl}
											bind:value={återseInputValue}
											type="number"
											placeholder="#"
											class="w-full rounded-lg bg-gray-100 px-3 py-1.5 text-base ring-1 ring-gray-200 focus:outline-none focus:ring-1 focus:ring-lyskom-500"
										/>
										<button
											type="submit"
											disabled={!återseInputValue.trim()}
											class="shrink-0 rounded-lg bg-gray-900/80 px-3 py-1.5 text-sm text-white disabled:opacity-30"
										>Visa</button>
									</form>
								</div>
							{:else}
								<button onclick={() => { showÅterseInput = true; tick().then(() => återseInputEl?.focus()); }} class="flex w-full items-center px-4 py-2.5 text-sm text-gray-700 active:bg-gray-100">
									Återse text
								</button>
								<div class="mx-3 my-1 border-t border-gray-100"></div>
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
							{/if}
						</div>
					{/if}
				</div>
			{/if}

			<div class="flex-1"></div>

			<!-- Next button -->
			{#if nextAction.type !== 'all-done'}
				<button
					onclick={() => advanceReading()}
					class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-900/80 backdrop-blur-md ring-[1.5px] ring-white/25 active:bg-gray-700"
					aria-label="Nästa olästa"
				>
					<ChevronRight size={24} class="text-white" />
				</button>
			{/if}
		</div>
	</div>
{/if}
