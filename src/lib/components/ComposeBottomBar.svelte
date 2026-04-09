<script lang="ts">
	import { slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { readingState } from '$lib/stores/reading';
	import { getTextById, getUserById } from '$lib/data';
	import { ArrowUp as ScrollUpIcon } from 'lucide-svelte';
	import ComposeForm from './ComposeForm.svelte';

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

	const isVisible = $derived(!!commentToText);

	function handleScrollToParent() {
		if ($readingState.commentTo) {
			onScrollToText?.($readingState.commentTo);
		}
	}
</script>

{#if isVisible}
	<div
		class="hidden md:flex justify-center px-4"
	>
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

			<ComposeForm
				{commentToText}
				variant="bottombar"
				{onExpand}
			/>
		</div>
	</div>
{/if}
