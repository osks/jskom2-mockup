<script lang="ts">
	import { tick } from 'svelte';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { readingState, clearCommentTo, cancelCompose } from '$lib/stores/reading';
	import { conferences, getTextById, getUserById } from '$lib/data';
	import { ArrowUp, Check, X, Pencil } from 'lucide-svelte';

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
			showMeta = true;
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
		el.style.height = Math.min(el.scrollHeight, 250) + 'px';
	}

	const selectedConferenceName = $derived(
		conferences.find((c) => c.id === selectedConference)?.name ?? ''
	);
</script>

{#if isVisible}
	<!-- Floating compose overlay -->
	<div
		class="fixed inset-x-0 bottom-0 top-12 z-40 flex flex-col md:inset-0 md:pointer-events-none md:items-center md:justify-center md:bg-transparent md:p-6"
		transition:fly={{ y: 300, duration: 300, easing: cubicOut }}
	>
		<div class="flex flex-1 flex-col overflow-y-auto rounded-t-3xl bg-gray-50 shadow-[0_-4px_24px_rgba(0,0,0,0.12)] md:rounded-2xl md:shadow-[0_0_0_0.5px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.12)] md:pointer-events-auto md:flex-initial md:w-full md:max-w-lg md:max-h-[85vh] md:bg-gray-200/40 md:backdrop-blur-md md:ring-1 md:ring-white/80">
			<!-- Header -->
			<div class="flex items-center justify-between px-4 pt-3 pb-1">
				<h2 class="text-sm font-medium text-gray-700">
					{#if isComment}
						Kommentera
					{:else}
						Nytt inlägg
					{/if}
				</h2>
				<button
					onclick={handleCancel}
					class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200/70 backdrop-blur-md ring-[1.5px] ring-white/80 shadow-[0_0_0_0.5px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.08)] text-gray-800 active:bg-gray-300/50 md:h-8 md:w-8"
				>
					<X size={18} />
				</button>
			</div>

			<!-- Quoted original text (reply mode) -->
			{#if isComment && commentToText}
				<div class="mx-4 mt-3 max-h-40 overflow-y-auto border-l-2 border-gray-300 pl-3">
					<div class="text-sm font-semibold text-gray-700">
						{commentToAuthor?.name ?? 'Okänd'}
					</div>
					<div class="mt-1 text-base leading-relaxed text-gray-600 whitespace-pre-wrap break-words md:text-sm">
						{commentToText.body}
					</div>
				</div>
			{/if}

			<!-- Conference + subject -->
			<div class="mx-4 mt-2">
				{#if showMeta}
					<!-- Editable fields -->
					<div class="space-y-1.5">
						<select
							bind:value={selectedConference}
							class="w-full rounded-full bg-white px-3 py-1.5 text-sm text-gray-700 ring-1 ring-gray-200 focus:outline-none focus:ring-1 focus:ring-lyskom-500 md:bg-white/60 md:ring-white/80 md:focus:bg-white/80"
						>
							{#each conferences as conf}
								<option value={conf.id}>{conf.name}</option>
							{/each}
						</select>
						<input
							type="text"
							bind:value={subject}
							placeholder="Ärende..."
							class="w-full rounded-full bg-white px-3 py-1.5 text-sm ring-1 ring-gray-200 focus:outline-none focus:ring-1 focus:ring-lyskom-500 md:bg-white/60 md:ring-white/80 md:focus:bg-white/80"
						/>
					</div>
				{:else}
					<!-- Static display -->
					<button
						onclick={() => showMeta = true}
						class="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
					>
						<span>{selectedConferenceName} · {subject || 'Inget ärende'}</span>
						<Pencil size={12} />
					</button>
				{/if}
			</div>

			<!-- Input widget (textarea + send) -->
			<div class="safe-bottom sticky bottom-0 px-3 pb-5 pt-2 bg-gray-50 md:bg-transparent">
				<div class="flex flex-col rounded-2xl bg-white ring-1 ring-gray-200 focus-within:ring-1 focus-within:ring-lyskom-500 md:bg-white/60 md:ring-white/80 md:focus-within:ring-lyskom-500">
					<textarea
						bind:this={textareaEl}
						bind:value={body}
						onkeydown={handleKeydown}
						oninput={autoGrow}
						rows={3}
						placeholder={isComment ? 'Skriv din kommentar...' : 'Skriv ditt inlägg...'}
						class="w-full resize-none bg-transparent px-3 pt-3 pb-1 text-base text-gray-800 placeholder:text-gray-400 focus:outline-none md:text-sm"
						style="max-height: 250px;"
					></textarea>
					<div class="flex items-center justify-end px-2 pb-2">
						<button
							onclick={handleSend}
							disabled={sent || !body.trim()}
							class="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900/80 text-white active:bg-gray-700 disabled:opacity-30 transition-opacity"
						>
							{#if sent}
								<Check size={18} />
							{:else}
								<ArrowUp size={18} />
							{/if}
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
