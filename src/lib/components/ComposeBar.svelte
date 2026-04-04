<script lang="ts">
	import { readingState, clearCommentTo, cancelCompose } from '$lib/stores/reading';
	import { conferences, getTextById, getUserById } from '$lib/data';
	import { Send, X, ChevronDown, ChevronUp } from 'lucide-svelte';

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
	let showOriginal = $state(false);
	let textareaEl: HTMLTextAreaElement | undefined = $state();

	// Update defaults when commentTo changes
	$effect(() => {
		if (commentToText) {
			selectedConference = commentToText.recipients[0] ?? 1;
			subject = `Re: ${commentToText.subject.replace(/^Re: /, '')}`;
			showOriginal = false;
			tick().then(() => textareaEl?.focus());
		}
	});

	// Focus when opening new compose
	$effect(() => {
		if ($readingState.composingNew && !commentToText) {
			selectedConference = $readingState.currentConference ?? 1;
			subject = '';
			showOriginal = false;
			tick().then(() => textareaEl?.focus());
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

	import { tick } from 'svelte';
</script>

{#if isVisible}
	<!-- Full-screen overlay -->
	<div class="fixed inset-0 z-40 flex flex-col bg-white md:bg-black/30 md:items-center md:justify-center md:p-8">
		<!-- On desktop: centered card. On mobile: full screen -->
		<div class="flex flex-1 flex-col bg-white md:flex-initial md:w-full md:max-w-xl md:rounded-lg md:shadow-lg md:max-h-[80vh]">
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-gray-100 px-4 py-3">
				<h2 class="text-sm font-medium text-gray-900">
					{#if commentToText}
						Kommentera
					{:else}
						Nytt inlägg
					{/if}
				</h2>
				<button
					onclick={handleCancel}
					class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
				>
					<X size={18} />
				</button>
			</div>

			<!-- Original text (collapsible, only for comments) -->
			{#if commentToText}
				<button
					onclick={() => showOriginal = !showOriginal}
					class="flex items-center gap-2 border-b border-gray-100 px-4 py-2 text-left text-xs text-gray-500 hover:bg-gray-50"
				>
					{#if showOriginal}
						<ChevronUp size={14} class="shrink-0 text-gray-400" />
					{:else}
						<ChevronDown size={14} class="shrink-0 text-gray-400" />
					{/if}
					<span class="font-medium">{commentToAuthor?.name ?? 'Okänd'}</span>
					<span class="min-w-0 truncate text-gray-400">{commentToText.subject}</span>
				</button>
				{#if showOriginal}
					<div class="max-h-40 overflow-y-auto border-b border-gray-100 bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-600 whitespace-pre-wrap">
						{commentToText.body}
					</div>
				{/if}
			{/if}

			<!-- Conference + subject -->
			<div class="border-b border-gray-100 px-4 py-2 space-y-2">
				<select
					bind:value={selectedConference}
					class="w-full rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm text-gray-700"
				>
					{#each conferences as conf}
						<option value={conf.id}>{conf.name}</option>
					{/each}
				</select>
				<input
					type="text"
					bind:value={subject}
					placeholder="Ärende..."
					class="w-full rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm"
				/>
			</div>

			<!-- Body -->
			<div class="flex flex-1 flex-col p-4">
				<textarea
					bind:this={textareaEl}
					bind:value={body}
					onkeydown={handleKeydown}
					placeholder={commentToText ? 'Skriv din kommentar...' : 'Skriv ditt inlägg...'}
					class="flex-1 min-h-[120px] resize-none rounded border border-gray-200 bg-gray-50 px-3 py-2 text-base text-gray-800 placeholder:text-gray-400 focus:border-lyskom-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-lyskom-400 md:text-sm"
				></textarea>
			</div>

			<!-- Footer -->
			<div class="flex items-center justify-between border-t border-gray-100 px-4 py-3">
				<span class="text-xs text-gray-400">
					{#if body.trim()}
						Ctrl+Enter för att skicka
					{/if}
				</span>
				<button
					onclick={handleSend}
					disabled={sent || !body.trim()}
					class="flex items-center gap-2 rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-30"
				>
					{#if sent}
						<span>Skickat &#10003;</span>
					{:else}
						<Send size={14} />
						Skicka
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}
