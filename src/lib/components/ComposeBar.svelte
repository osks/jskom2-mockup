<script lang="ts">
	import { readingState, clearCommentTo, cancelCompose } from '$lib/stores/reading';
	import { conferences, getTextById, getUserById } from '$lib/data';
	import { Send, X } from 'lucide-svelte';

	const commentToText = $derived(
		$readingState.commentTo ? getTextById($readingState.commentTo) : null
	);
	const commentToAuthor = $derived(
		commentToText ? getUserById(commentToText.author) : null
	);

	const isVisible = $derived(!!commentToText || $readingState.composingNew);

	let selectedConference = $state(1);
	let subject = $state('');
	let body = $state('');
	let sent = $state(false);
	let textareaEl: HTMLTextAreaElement | undefined = $state();

	// Update defaults when commentTo changes
	$effect(() => {
		if (commentToText) {
			selectedConference = commentToText.recipients[0] ?? 1;
			subject = `Re: ${commentToText.subject.replace(/^Re: /, '')}`;
			textareaEl?.focus();
		}
	});

	// Focus when opening new compose
	$effect(() => {
		if ($readingState.composingNew && !commentToText) {
			selectedConference = $readingState.currentConference ?? 1;
			subject = '';
			textareaEl?.focus();
		}
	});

	function handleSend() {
		sent = true;
		setTimeout(() => {
			sent = false;
			body = '';
			subject = '';
			clearCommentTo();
			cancelCompose();
		}, 1500);
	}

	function handleCancel() {
		body = '';
		subject = '';
		clearCommentTo();
		cancelCompose();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
			e.preventDefault();
			handleSend();
		}
		if (e.key === 'Escape') {
			handleCancel();
		}
	}
</script>

{#if isVisible}
	<div class="shrink-0 border-t border-gray-200 bg-white">
		<!-- Header: comment reference or new text indicator -->
		<div class="flex items-center gap-2 px-4 py-1.5 text-xs text-gray-500">
			{#if commentToText}
				<span class="text-gray-300">&larrhk;</span>
				<span class="min-w-0 truncate">
					{commentToAuthor?.name ?? 'Okänd'}: {commentToText.subject}
				</span>
			{:else}
				<span class="text-gray-400">Nytt inlägg</span>
			{/if}
			<button
				onclick={handleCancel}
				class="ml-auto shrink-0 rounded p-1 text-gray-300 hover:bg-gray-100 hover:text-gray-500"
			>
				<X size={14} />
			</button>
		</div>

		<div class="px-4 pb-3">
			<!-- Conference + subject row -->
			<div class="mb-2 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2">
				<select
					bind:value={selectedConference}
					class="w-full rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-base text-gray-700 sm:w-auto sm:text-sm"
				>
					{#each conferences as conf}
						<option value={conf.id}>{conf.name}</option>
					{/each}
				</select>
				<input
					type="text"
					bind:value={subject}
					placeholder="Ärende..."
					class="w-full rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-base sm:flex-1 sm:text-sm"
				/>
			</div>

			<div class="flex gap-2">
				<textarea
					bind:this={textareaEl}
					bind:value={body}
					onkeydown={handleKeydown}
					rows={3}
					placeholder={commentToText ? 'Skriv din kommentar...' : 'Skriv ditt inlägg...'}
					class="flex-1 resize-none rounded border border-gray-200 bg-gray-50 px-3 py-2 text-base text-gray-800 placeholder:text-gray-400 focus:border-lyskom-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-lyskom-400 sm:text-sm"
				></textarea>

				<div class="flex flex-col gap-1">
					<button
						onclick={handleSend}
						disabled={sent || !body.trim()}
						class="flex h-9 w-9 items-center justify-center rounded bg-lyskom-600 text-white hover:bg-lyskom-700 disabled:opacity-30 sm:h-8 sm:w-8"
					>
						{#if sent}
							<span class="text-xs">&#10003;</span>
						{:else}
							<Send size={14} />
						{/if}
					</button>
					<button
						onclick={handleCancel}
						class="flex h-9 w-9 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600 sm:h-8 sm:w-8"
					>
						<X size={14} />
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
