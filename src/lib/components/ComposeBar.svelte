<script lang="ts">
	import { tick } from 'svelte';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { readingState, clearCommentTo, cancelCompose } from '$lib/stores/reading';
	import { conferences, getTextById, getUserById, getConferenceById } from '$lib/data';
	import { ArrowUp, Check, X, Pencil } from 'lucide-svelte';

	const commentToText = $derived(
		$readingState.commentTo ? getTextById($readingState.commentTo) : null
	);
	const commentToAuthor = $derived(
		commentToText ? getUserById(commentToText.author) : null
	);

	const isVisible = $derived(!!commentToText || $readingState.composingNew);
	const isComment = $derived(!!commentToText);

	let recipients = $state<number[]>([1]);
	let subject = $state('');
	let body = $state('');
	let sent = $state(false);
	let showMeta = $state(false);
	let textareaEl: HTMLTextAreaElement | undefined = $state();

	// Update defaults when commentTo changes
	$effect(() => {
		if (commentToText) {
			recipients = [...commentToText.recipients];
			subject = `Re: ${commentToText.subject.replace(/^Re: /, '')}`;
			showMeta = false;
			tick().then(() => {
				// Wait for fly transition to finish before scrolling
				setTimeout(() => {
					textareaEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
					setTimeout(() => textareaEl?.focus(), 300);
				}, 350);
			});
		}
	});

	// Focus when opening new compose
	$effect(() => {
		if ($readingState.composingNew && !commentToText) {
			recipients = $readingState.currentConference ? [$readingState.currentConference] : [1];
			subject = '';
			showMeta = true;
			tick().then(() => textareaEl?.focus());
		}
	});

	const recipientNames = $derived(
		recipients.map((id) => getConferenceById(id)?.name ?? `Möte ${id}`)
	);

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
		recipients = [1];
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

	function updateRecipient(index: number, value: number) {
		recipients = recipients.map((r, i) => i === index ? value : r);
	}
</script>

{#if isVisible}
	<!-- Floating compose overlay -->
	<div
		class="fixed inset-x-0 bottom-0 top-12 z-40 flex flex-col md:inset-0 md:pointer-events-none md:items-center md:justify-center md:bg-transparent md:p-6"
	>
		<div
			class="flex flex-1 flex-col overflow-y-auto rounded-t-3xl bg-gray-50 shadow-[0_-4px_24px_rgba(0,0,0,0.12)] md:rounded-2xl md:shadow-[0_0_0_0.5px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.12)] md:pointer-events-auto md:flex-initial md:w-full md:max-w-lg md:max-h-[85vh] md:bg-gray-200/40 md:backdrop-blur-md md:ring-1 md:ring-white/80"
			transition:fly={{ y: window.innerHeight, duration: 300, easing: cubicOut }}
		>
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
				<div class="mx-4 mt-3 border-l-2 border-gray-300 pl-3">
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
					<div class="space-y-2 py-0.5">
						{#each recipients as recipientId, i}
							<div class="flex items-center gap-2">
								<span class="shrink-0 text-sm text-gray-400">@</span>
								<select
									value={recipientId}
									onchange={(e) => updateRecipient(i, Number((e.target as HTMLSelectElement).value))}
									class="flex-1 rounded-full bg-white px-3 py-1.5 text-sm text-gray-700 ring-1 ring-gray-200 focus:outline-none focus:ring-1 focus:ring-lyskom-500 md:bg-white/60 md:ring-white/80 md:focus:bg-white/80"
								>
									{#each conferences as conf}
										<option value={conf.id}>{conf.name}</option>
									{/each}
								</select>
							</div>
						{/each}
						<div class="flex items-center gap-2">
							<span class="shrink-0 text-sm text-gray-400">Ärende</span>
							<input
								type="text"
								bind:value={subject}
								placeholder="Ärende..."
								class="flex-1 rounded-full bg-white px-3 py-1.5 text-sm ring-1 ring-gray-200 focus:outline-none focus:ring-1 focus:ring-lyskom-500 md:bg-white/60 md:ring-white/80 md:focus:bg-white/80"
							/>
						</div>
					</div>
				{:else}
					<!-- Static display -->
					<div class="flex items-start justify-between">
						<div class="flex flex-col gap-0.5">
							{#each recipientNames as name}
								<div class="text-sm text-gray-500">
									<span class="text-gray-400">@</span> {name}
								</div>
							{/each}
							<div class="text-sm text-gray-700">
								Ärende: {subject || 'Inget ärende'}
							</div>
						</div>
						<button
							onclick={() => showMeta = true}
							class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-200/50 hover:text-gray-600 transition-colors"
							aria-label="Redigera"
						>
							<Pencil size={14} />
						</button>
					</div>
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
