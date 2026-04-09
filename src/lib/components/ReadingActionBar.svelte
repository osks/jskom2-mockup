<script lang="ts">
	import { readingState, advanceReading, setCommentTo, reviewText } from '$lib/stores/reading';
	import { getTextById, getUserById } from '$lib/data';
	import { Ellipsis, MessageSquare } from 'lucide-svelte';
	import { tick } from 'svelte';

	const nextAction = $derived($readingState.nextAction);
	const activeTextId = $derived($readingState.activeTextId);
	const activeText = $derived(activeTextId ? getTextById(activeTextId) : null);
	const hasTexts = $derived($readingState.buffer.some((b) => b.kind === 'text'));
	const composing = $derived(!!$readingState.commentTo || $readingState.composingNew);
	const visible = $derived(hasTexts || nextAction.type !== 'all-done');

	let moreMenuOpen = $state(false);
	let showReviewInput = $state(false);
	let reviewInputValue = $state('');
	let reviewInputEl: HTMLInputElement | undefined = $state();

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

	function handleReview() {
		const id = parseInt(reviewInputValue.trim(), 10);
		if (!isNaN(id) && id > 0) {
			reviewText(id);
			closeReviewInput();
		}
	}

	function closeReviewInput() {
		reviewInputEl?.blur();
		showReviewInput = false;
		reviewInputValue = '';
	}
</script>

{#if visible}
	<div class="pointer-events-none fixed left-0 right-0 bottom-0 z-20 flex items-end justify-center px-5 md:px-4 md:left-80" style="padding-bottom: max(env(safe-area-inset-bottom, 0px), 1.25rem);"
		class:hidden={composing}
	>
		<div class="flex w-full max-w-3xl items-center gap-2.5 pointer-events-auto"
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
						<div role="button" tabindex="-1" class="fixed inset-0 z-30" onclick={closeMoreMenu} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') closeMoreMenu(); }}></div>
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

<!-- Återse text dialog -->
{#if showReviewInput}
	<div role="button" tabindex="-1" class="fixed inset-0 z-50 flex items-center justify-center bg-black/20" onclick={closeReviewInput} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') closeReviewInput(); }}>
		<div role="presentation" class="mx-6 w-full max-w-xs rounded-2xl bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border-[0.5px] border-surface-5" onclick={(e) => e.stopPropagation()}>
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
