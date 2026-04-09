<script lang="ts">
	import { readingState, clearCommentTo, cancelCompose } from '$lib/stores/reading';
	import { getTextById, getUserById } from '$lib/data';
	import { ArrowUp as ScrollUpIcon, SplitSquareVertical, X } from 'lucide-svelte';
	import { createComposeState } from './compose/composeState.svelte.ts';
	import ComposeFormContent from './compose/ComposeFormContent.svelte';

	interface Props {
		onScrollToText?: (textId: number) => void;
		onExpand?: () => void;
	}

	let { onScrollToText, onExpand }: Props = $props();

	const commentToText = $derived(
		$readingState.commentTo ? getTextById($readingState.commentTo) : null
	);

	const commentToAuthor = $derived(
		commentToText ? getUserById(commentToText.author) : null
	);

	const isVisible = $derived(!!commentToText || $readingState.composingNew);

	const initialRecipient = $derived(
		!commentToText && $readingState.currentConference ? $readingState.currentConference : null
	);

	const compose = createComposeState({
		get commentToText() { return commentToText; },
		get initialRecipient() { return initialRecipient; },
	});

	function handleScrollToParent() {
		if ($readingState.commentTo) {
			onScrollToText?.($readingState.commentTo);
		}
	}

	function handleClose() {
		clearCommentTo();
		cancelCompose();
	}
</script>

{#if isVisible}
	<div class="hidden md:flex justify-center px-4">
		<div class="w-full max-w-3xl border-t border-edge">
			<!-- "Replying to" context bar -->
			{#if commentToText}
				<div class="flex items-center gap-2 pt-2 pb-0">
					<button
						onclick={handleScrollToParent}
						class="flex items-center gap-1.5 text-xs text-txt-muted hover:text-txt-secondary transition-colors group"
					>
						<ScrollUpIcon size={12} class="opacity-50 group-hover:opacity-100 transition-opacity" />
						<span>Svar till <span class="font-mono">#{commentToText.id}</span> av {commentToAuthor?.name ?? 'Okänd'}</span>
					</button>
				</div>
			{/if}

			<!-- Header -->
			<div class="flex items-center justify-between pt-3 pb-1">
				<h2 class="text-sm font-medium text-txt-secondary">
					{#if compose.isComment}
						Kommentera
					{:else}
						Nytt inlägg
					{/if}
				</h2>
				<div class="flex items-center gap-1">
					{#if compose.showDiscardWarning}
						<button
							onclick={compose.doCancel}
							class="flex h-8 items-center rounded-full bg-accent px-3 text-sm font-medium text-txt-inverse hover:bg-accent-hover active:bg-accent-active transition-colors"
						>Kasta</button>
						<button
							onclick={() => compose.showDiscardWarning = false}
							class="flex h-8 items-center rounded-full px-3 text-sm text-txt-muted ring-1 ring-edge hover:bg-surface-3/50 hover:text-txt-secondary transition-colors"
						>Avbryt</button>
					{:else}
						{#if onExpand}
							<button
								onclick={onExpand}
								class="flex h-8 w-8 items-center justify-center rounded-full text-txt-muted ring-1 ring-edge hover:bg-surface-3/50 hover:text-txt-secondary transition-colors"
								aria-label="Utökad"
							>
								<SplitSquareVertical size={14} />
							</button>
						{/if}
						<button
							onclick={handleClose}
							class="flex h-8 w-8 items-center justify-center rounded-full text-txt ring-1 ring-edge active:bg-surface-4/50"
						>
							<X size={18} />
						</button>
					{/if}
				</div>
			</div>

			<!-- Form content in fixed-height textarea container -->
			<div class="pt-2 pb-6">
				<div class="flex flex-col rounded-3xl bg-surface-1 ring-1 ring-edge-strong focus-within:ring-1 focus-within:ring-edge-focus">
					<ComposeFormContent compose={compose} textareaClass="text-sm" />
				</div>
			</div>
		</div>
	</div>
{/if}
