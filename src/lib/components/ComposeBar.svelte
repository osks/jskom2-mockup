<script lang="ts">
	import { readingState, clearCommentTo } from '$lib/stores/reading';
	import { conferences, getTextById } from '$lib/data';
	import { Send, X } from 'lucide-svelte';

	const commentToText = $derived(
		$readingState.commentTo ? getTextById($readingState.commentTo) : null
	);

	const defaultConferenceId = $derived(
		$readingState.currentConference ?? 1
	);

	let selectedConference = $state(1);
	let subject = $state('');
	let body = $state('');
	let expanded = $state(false);
	let sent = $state(false);
	let textareaEl: HTMLTextAreaElement | undefined = $state();

	// Update defaults when commentTo changes
	$effect(() => {
		if (commentToText) {
			selectedConference = commentToText.recipients[0] ?? 1;
			subject = `Re: ${commentToText.subject.replace(/^Re: /, '')}`;
			expanded = true;
			textareaEl?.focus();
		}
	});

	function handleSend() {
		sent = true;
		setTimeout(() => {
			sent = false;
			body = '';
			subject = '';
			expanded = false;
			clearCommentTo();
		}, 1500);
	}

	function handleCancel() {
		body = '';
		subject = '';
		expanded = false;
		clearCommentTo();
	}

	function handleFocus() {
		expanded = true;
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

<div class="shrink-0 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)]">
	<!-- Comment reference -->
	{#if commentToText}
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
	{/if}

	<div class="px-3 py-2 sm:px-4 sm:py-3">
		{#if expanded}
			<!-- Expanded: conference + subject -->
			<div class="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center">
				<select
					bind:value={selectedConference}
					class="w-full rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs text-gray-700 sm:w-auto"
				>
					{#each conferences as conf}
						<option value={conf.id}>{conf.name}</option>
					{/each}
				</select>
				<input
					type="text"
					bind:value={subject}
					placeholder="Ärende..."
					class="w-full rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs sm:flex-1"
				/>
			</div>
		{/if}

		<div class="flex gap-2">
			<textarea
				bind:this={textareaEl}
				bind:value={body}
				onfocus={handleFocus}
				onkeydown={handleKeydown}
				rows={expanded ? 3 : 1}
				placeholder="Skriv ett inlägg..."
				class="flex-1 resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 font-mono placeholder:text-gray-400 placeholder:font-sans focus:border-lyskom-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-lyskom-400 transition-colors"
			></textarea>

			{#if expanded}
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
			{/if}
		</div>
	</div>
</div>
