<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { readingState } from '$lib/stores/reading';
	import { getTextById, getUserById } from '$lib/data';
	import { X } from 'lucide-svelte';
	import { createComposeState } from './compose/composeState.svelte.ts';
	import ComposeFormContent from './compose/ComposeFormContent.svelte';

	const commentToText = $derived(
		$readingState.commentTo ? getTextById($readingState.commentTo) : null
	);
	const commentToAuthor = $derived(
		commentToText ? getUserById(commentToText.author) : null
	);

	// Mobile only: show for any compose (comment or new text)
	const mobileVisible = $derived(!!commentToText || $readingState.composingNew);

	const compose = createComposeState({
		get commentToText() { return commentToText; },
		get initialRecipient() { return $readingState.currentConference; },
	});
</script>

<!-- Mobile overlay (bottom sheet) -->
{#if mobileVisible}
	<div
		class="fixed inset-x-0 bottom-0 top-12 z-40 flex flex-col md:hidden"
	>
		<div
			class="flex flex-1 flex-col overflow-y-auto rounded-t-3xl bg-surface-1 shadow-[0_-4px_24px_rgba(0,0,0,0.12)]"
			transition:fly={{ y: window.innerHeight, duration: 300, easing: cubicOut }}
		>
			<!-- Header -->
			<div class="flex items-center justify-between px-4 pt-3 pb-1">
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
						<button
							onclick={compose.handleCancel}
							class="flex h-12 w-12 items-center justify-center rounded-full text-txt bg-surface-4/70 backdrop-blur-md ring-[1.5px] ring-surface-1/80 shadow-[0_0_0_0.5px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.08)] active:bg-surface-4/50"
						>
							<X size={18} />
						</button>
					{/if}
				</div>
			</div>

			<!-- Quoted original text -->
			{#if compose.isComment && commentToText}
				<div class="mx-4 mt-3 border-l-2 border-surface-3 pl-3">
					<div class="text-sm font-semibold text-txt-secondary">
						{commentToAuthor?.name ?? 'Okänd'}
					</div>
					<div class="mt-1 text-base leading-relaxed text-txt-secondary whitespace-pre-wrap break-words">
						{commentToText.body}
					</div>
				</div>
			{/if}

			<!-- Form content: flex-fill textarea -->
			<div class="flex-1 flex flex-col min-h-0 px-4" style="padding-bottom: max(env(safe-area-inset-bottom, 0px) + 1rem, 1.5rem)">
				<div class="mt-2 flex flex-col rounded-3xl bg-surface-1 ring-1 ring-edge-strong focus-within:ring-1 focus-within:ring-edge-focus flex-1 min-h-0">
					<ComposeFormContent compose={compose} textareaClass="text-base flex-1" metaClass="mt-2 px-4" />
				</div>
			</div>
		</div>
	</div>
{/if}
