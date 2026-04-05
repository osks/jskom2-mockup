<script lang="ts">
	import { tick } from 'svelte';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
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
		el.style.height = Math.min(el.scrollHeight, 250) + 'px';
	}

	const selectedConferenceName = $derived(
		conferences.find((c) => c.id === selectedConference)?.name ?? ''
	);
</script>

{#if isVisible}
	<!-- Floating compose overlay -->
	<div
		class="fixed inset-0 z-40 flex flex-col bg-gray-50 md:pointer-events-none md:items-center md:justify-center md:bg-transparent md:p-6"
		transition:fly={{ y: 300, duration: 300, easing: cubicOut }}
	>
		<div class="flex flex-1 flex-col overflow-y-auto md:pointer-events-auto md:flex-initial md:w-full md:max-w-lg md:max-h-[85vh] md:rounded-2xl md:bg-gray-200/40 md:backdrop-blur-md md:ring-1 md:ring-white/80 md:shadow-[0_0_0_0.5px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.12)]">
			<!-- Header -->
			<div class="safe-top flex items-center justify-between px-4 pt-3 pb-1">
				<h2 class="text-sm font-medium text-gray-700">
					{#if isComment}
						Kommentera
					{:else}
						Nytt inlägg
					{/if}
				</h2>
				<button
					onclick={handleCancel}
					class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200/70 backdrop-blur-md ring-[1.5px] ring-white/80 shadow-[0_0_0_0.5px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.08)] text-gray-600 active:bg-gray-300/50"
				>
					<X size={14} />
				</button>
			</div>

			<!-- Quoted original text (reply mode) -->
			{#if isComment && commentToText}
				<div class="mx-3 mt-2 max-h-32 overflow-y-auto rounded-xl bg-white/30 px-3 py-2 ring-1 ring-white/60">
					<div class="text-xs font-medium text-gray-500">
						{commentToAuthor?.name ?? 'Okänd'}
					</div>
					<div class="mt-0.5 text-sm leading-relaxed text-gray-600 whitespace-pre-wrap break-words">
						{commentToText.body}
					</div>
				</div>
			{/if}

			<!-- Conference + subject -->
			{#if isComment && !showMeta}
				<button
					onclick={() => showMeta = true}
					class="mx-3 mt-2 rounded-full bg-white/40 px-3 py-1 text-left text-xs text-gray-500 ring-1 ring-white/60 hover:bg-white/60 transition-colors"
				>
					{selectedConferenceName} · {subject}
				</button>
			{:else}
				<div class="mx-3 mt-2 space-y-1.5">
					<select
						bind:value={selectedConference}
						class="w-full rounded-full bg-white/60 px-3 py-1.5 text-sm text-gray-700 ring-1 ring-white/80 focus:bg-white/80 focus:outline-none focus:ring-1 focus:ring-lyskom-500"
					>
						{#each conferences as conf}
							<option value={conf.id}>{conf.name}</option>
						{/each}
					</select>
					<input
						type="text"
						bind:value={subject}
						placeholder="Ärende..."
						class="w-full rounded-full bg-white/60 px-3 py-1.5 text-sm ring-1 ring-white/80 focus:bg-white/80 focus:outline-none focus:ring-1 focus:ring-lyskom-500"
					/>
				</div>
			{/if}

			<!-- Body -->
			<div class="flex flex-1 flex-col px-3 pt-2">
				<textarea
					bind:this={textareaEl}
					bind:value={body}
					onkeydown={handleKeydown}
					oninput={autoGrow}
					rows={3}
					placeholder={isComment ? 'Skriv din kommentar...' : 'Skriv ditt inlägg...'}
					class="w-full resize-none rounded-xl bg-white/60 px-3 py-2 text-base text-gray-800 ring-1 ring-white/80 placeholder:text-gray-400 focus:bg-white/80 focus:outline-none focus:ring-1 focus:ring-lyskom-500 md:text-sm"
					style="max-height: 250px;"
				></textarea>
			</div>

			<!-- Footer -->
			<div class="safe-bottom flex items-center justify-between px-4 pt-1 pb-3">
				<span class="text-xs text-gray-400">
					{#if body.trim()}
						&#8984;Enter
					{/if}
				</span>
				<button
					onclick={handleSend}
					disabled={sent || !body.trim()}
					class="flex items-center gap-2 rounded-full bg-gray-900/80 backdrop-blur-md ring-[1.5px] ring-white/25 px-5 py-2 text-sm font-medium text-white active:bg-gray-700 disabled:opacity-30"
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
