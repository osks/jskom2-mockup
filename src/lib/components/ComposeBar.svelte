<script lang="ts">
	import { readingState, clearCommentTo } from '$lib/stores/reading';
	import { conferences, getTextById } from '$lib/data';
	import { Send, X } from 'lucide-svelte';

	const commentToText = $derived(
		$readingState.commentTo ? getTextById($readingState.commentTo) : null
	);

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

	function handleSend() {
		sent = true;
		setTimeout(() => {
			sent = false;
			body = '';
			subject = '';
			clearCommentTo();
		}, 1500);
	}

	function handleCancel() {
		body = '';
		subject = '';
		clearCommentTo();
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

{#if commentToText}
	<div class="shrink-0 border-t border-gray-200 bg-white">
		<!-- Comment reference -->
		<div class="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-3 py-1.5 sm:px-4">
			<svg class="h-3 w-3 shrink-0 text-lyskom-600" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
				<path d="M8 2L4 6l4 4" />
			</svg>
			<span class="min-w-0 truncate text-xs text-gray-600">
				Kommentar till <span class="font-mono font-medium text-lyskom-600">#{commentToText.id}</span>
				<span class="hidden sm:inline">— {commentToText.subject}</span>
			</span>
			<button
				onclick={clearCommentTo}
				class="ml-auto shrink-0 p-1 text-gray-400 hover:text-gray-600"
			>
				<X size={14} />
			</button>
		</div>

		<div class="px-3 py-2 sm:px-4 sm:py-3">
			<!-- Conference + subject -->
			<div class="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center">
				<select
					bind:value={selectedConference}
					class="w-full rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-base text-gray-700 sm:w-auto sm:text-xs"
				>
					{#each conferences as conf}
						<option value={conf.id}>{conf.name}</option>
					{/each}
				</select>
				<input
					type="text"
					bind:value={subject}
					placeholder="Ärende..."
					class="w-full rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-base sm:flex-1 sm:text-xs"
				/>
			</div>

			<div class="flex gap-2">
				<textarea
					bind:this={textareaEl}
					bind:value={body}
					onkeydown={handleKeydown}
					rows={3}
					placeholder="Skriv din kommentar..."
					class="flex-1 resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-base text-gray-800 font-mono placeholder:text-gray-400 placeholder:font-sans focus:border-lyskom-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-lyskom-400 transition-colors sm:text-sm"
				></textarea>

				<div class="flex flex-col gap-1">
					<button
						onclick={handleSend}
						disabled={sent || !body.trim()}
						class="flex h-9 w-9 items-center justify-center rounded-lg bg-lyskom-600 text-white hover:bg-lyskom-700 disabled:opacity-40 transition-colors sm:h-8 sm:w-8"
						title="Skicka (Ctrl+Enter)"
					>
						{#if sent}
							<span class="text-xs">✓</span>
						{:else}
							<Send size={14} />
						{/if}
					</button>
					<button
						onclick={handleCancel}
						class="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors sm:h-8 sm:w-8"
						title="Avbryt (Esc)"
					>
						<X size={14} />
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
