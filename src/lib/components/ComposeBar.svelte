<script lang="ts">
	import { tick } from 'svelte';
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
	const isComment = $derived(!!commentToText);

	let selectedConference = $state(1);
	let subject = $state('');
	let body = $state('');
	let sent = $state(false);
	let showMeta = $state(false);
	let textareaEl: HTMLTextAreaElement | undefined = $state();

	// Update defaults when commentTo changes
	$effect(() => {
		if (commentToText) {
			selectedConference = commentToText.recipients[0] ?? 1;
			subject = `Re: ${commentToText.subject.replace(/^Re: /, '')}`;
			showMeta = false;
			tick().then(() => textareaEl?.focus());
		}
	});

	// Focus when opening new compose
	$effect(() => {
		if ($readingState.composingNew && !commentToText) {
			selectedConference = $readingState.currentConference ?? 1;
			subject = '';
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

	function autoGrow(e: Event) {
		const el = e.target as HTMLTextAreaElement;
		el.style.height = 'auto';
		el.style.height = Math.min(el.scrollHeight, 300) + 'px';
	}

	const selectedConferenceName = $derived(
		conferences.find((c) => c.id === selectedConference)?.name ?? ''
	);
</script>

{#if isVisible}
	<!-- Full-screen overlay -->
	<div class="fixed inset-0 z-40 flex flex-col bg-white md:bg-black/30 md:items-center md:justify-center md:p-8">
		<div class="flex flex-1 flex-col bg-white md:flex-initial md:w-full md:max-w-xl md:rounded-lg md:shadow-lg md:max-h-[80vh]">
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-gray-100 px-4 py-3">
				<h2 class="text-sm font-medium text-gray-900">
					{#if isComment}
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

			<!-- Quoted original text (always shown for comments, scrollable) -->
			{#if isComment && commentToText}
				<div class="max-h-48 overflow-y-auto border-b border-gray-100 bg-gray-50 px-4 py-3">
					<div class="mb-1 text-xs font-medium text-gray-500">
						{commentToAuthor?.name ?? 'Okänd'}
					</div>
					<div class="text-sm leading-relaxed text-gray-600 whitespace-pre-wrap break-words">
						{commentToText.body}
					</div>
				</div>
			{/if}

			<!-- Conference + subject -->
			{#if isComment && !showMeta}
				<button
					onclick={() => showMeta = true}
					class="w-full border-b border-gray-100 px-4 py-2 text-left text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50"
				>
					{selectedConferenceName} · {subject}
				</button>
			{:else}
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
			{/if}

			<!-- Body -->
			<div class="flex flex-1 flex-col p-4">
				<textarea
					bind:this={textareaEl}
					bind:value={body}
					onkeydown={handleKeydown}
					oninput={autoGrow}
					rows={3}
					placeholder={isComment ? 'Skriv din kommentar...' : 'Skriv ditt inlägg...'}
					class="w-full resize-none rounded border border-gray-200 bg-gray-50 px-3 py-2 text-base text-gray-800 placeholder:text-gray-400 focus:border-lyskom-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-lyskom-400 md:text-sm"
					style="max-height: 300px;"
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
