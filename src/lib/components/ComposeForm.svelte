<script lang="ts">
	import { tick } from 'svelte';
	import { readingState, clearCommentTo, cancelCompose, setComposeBody } from '$lib/stores/reading';
	import { conferences, getTextById, getUserById, getConferenceById } from '$lib/data';
	import { ArrowUp, Check, X, Pencil, Maximize2, Minimize2 } from 'lucide-svelte';
	import type { TextInfo } from '$lib/types';

	interface Props {
		commentToText: TextInfo | null;
		/** 'bottombar' = desktop bottom bar, 'overlay' = mobile sheet / desktop full-screen */
		variant?: 'bottombar' | 'overlay';
		onSend?: () => void;
		onCancel?: () => void;
		onExpand?: (() => void) | null;
		onCollapse?: (() => void) | null;
	}

	let {
		commentToText,
		variant = 'overlay',
		onSend,
		onCancel,
		onExpand = null,
		onCollapse = null
	}: Props = $props();

	const isBottomBar = $derived(variant === 'bottombar');

	const commentToAuthor = $derived(
		commentToText ? getUserById(commentToText.author) : null
	);

	const isComment = $derived(!!commentToText);

	let recipients = $state<number[]>([1]);
	let subject = $state('');
	let body = $state($readingState.composeBody || '');
	let sent = $state(false);
	let showMeta = $state(false);
	let textareaEl: HTMLTextAreaElement | undefined = $state();

	// Sync body to shared state so it persists across inline <-> expanded transitions
	$effect(() => {
		setComposeBody(body);
	});

	// Initialize body from shared state when mounting
	$effect(() => {
		if ($readingState.composeBody && !body) {
			body = $readingState.composeBody;
		}
	});

	// Update defaults when commentTo changes
	$effect(() => {
		if (commentToText) {
			recipients = [...commentToText.recipients];
			subject = `Re: ${commentToText.subject.replace(/^Re: /, '')}`;
			showMeta = false;
			tick().then(() => {
				if (isBottomBar) {
					// Bottom bar is already visible — just focus
					setTimeout(() => textareaEl?.focus(), 50);
				} else {
					// Overlay needs time for fly transition before scroll + focus
					setTimeout(() => {
						textareaEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
						setTimeout(() => textareaEl?.focus(), 300);
					}, 350);
				}
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
			onSend?.();
		}, 1500);
	}

	let showDiscardWarning = $state(false);

	function handleCancel() {
		if (body.trim()) {
			showDiscardWarning = true;
			return;
		}
		doCancel();
	}

	function doCancel() {
		showDiscardWarning = false;
		body = '';
		subject = '';
		recipients = [1];
		clearCommentTo();
		cancelCompose();
		onCancel?.();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
			e.preventDefault();
			handleSend();
		}
		if (e.key === 'Escape') {
			if (showDiscardWarning) {
				showDiscardWarning = false;
			} else {
				handleCancel();
			}
		}
	}

	function autoGrow(e: Event) {
		const el = e.target as HTMLTextAreaElement;
		el.style.height = 'auto';
		el.style.height = Math.min(el.scrollHeight, isBottomBar ? 180 : 250) + 'px';
	}

	function updateRecipient(index: number, value: number) {
		recipients = recipients.map((r, i) => i === index ? value : r);
	}
</script>

<!-- Header -->
<div class="flex items-center justify-between px-4 pt-3 pb-1">
	<h2 class="text-sm font-medium text-txt-secondary">
		{#if isComment}
			Kommentera
		{:else}
			Nytt inlägg
		{/if}
	</h2>
	<div class="flex items-center gap-1">
		{#if onCollapse}
			<button
				onclick={onCollapse}
				class="flex h-8 w-8 items-center justify-center rounded-full text-txt-muted hover:bg-surface-3/50 hover:text-txt-secondary transition-colors"
				aria-label="Minimera"
			>
				<Minimize2 size={14} />
			</button>
		{/if}
		{#if onExpand}
			<button
				onclick={onExpand}
				class="flex h-8 w-8 items-center justify-center rounded-full text-txt-muted hover:bg-surface-3/50 hover:text-txt-secondary transition-colors"
				aria-label="Expandera"
			>
				<Maximize2 size={14} />
			</button>
		{/if}
		<button
			onclick={handleCancel}
			class="flex items-center justify-center rounded-full text-txt active:bg-surface-4/50 {isBottomBar ? 'h-8 w-8' : 'h-12 w-12 bg-surface-4/70 backdrop-blur-md ring-[1.5px] ring-surface-1/80 shadow-[0_0_0_0.5px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.08)] md:h-8 md:w-8 md:bg-transparent md:ring-0 md:shadow-none'}"
		>
			<X size={18} />
		</button>
	</div>
</div>

<!-- Quoted original text (only in overlay mode, bottom bar has the parent text visible in stream) -->
{#if !isBottomBar && isComment && commentToText}
	<div class="mx-4 mt-3 border-l-2 border-surface-3 pl-3">
		<div class="text-sm font-semibold text-txt-secondary">
			{commentToAuthor?.name ?? 'Okänd'}
		</div>
		<div class="mt-1 text-base leading-relaxed text-txt-secondary whitespace-pre-wrap break-words md:text-sm">
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
					<span class="shrink-0 text-sm text-txt-muted">@</span>
					<select
						value={recipientId}
						onchange={(e) => updateRecipient(i, Number((e.target as HTMLSelectElement).value))}
						class="flex-1 rounded-full bg-surface-2 px-3 py-1.5 text-sm text-txt-secondary ring-1 ring-surface-3 focus:outline-none focus:ring-1 focus:ring-primary {isBottomBar ? '' : 'md:bg-surface-2/60 md:ring-surface-1/80 md:focus:bg-surface-2/80'}"
					>
						{#each conferences as conf}
							<option value={conf.id}>{conf.name}</option>
						{/each}
					</select>
				</div>
			{/each}
			<div class="flex items-center gap-2">
				<span class="shrink-0 text-sm text-txt-muted">Ärende</span>
				<input
					type="text"
					bind:value={subject}
					placeholder="Ärende..."
					class="flex-1 rounded-full bg-surface-2 px-3 py-1.5 text-sm ring-1 ring-surface-3 focus:outline-none focus:ring-1 focus:ring-primary {isBottomBar ? '' : 'md:bg-surface-2/60 md:ring-surface-1/80 md:focus:bg-surface-2/80'}"
				/>
			</div>
		</div>
	{:else}
		<!-- Static display -->
		<div class="flex items-start justify-between">
			<div class="flex flex-col gap-0.5">
				{#each recipientNames as name}
					<div class="text-sm text-txt-secondary">
						<span class="text-txt-muted">@</span> {name}
					</div>
				{/each}
				<div class="text-sm text-txt-secondary">
					Ärende: {subject || 'Inget ärende'}
				</div>
			</div>
			<button
				onclick={() => showMeta = true}
				class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-txt-muted hover:bg-surface-3/50 hover:text-txt-secondary transition-colors"
				aria-label="Redigera"
			>
				<Pencil size={14} />
			</button>
		</div>
	{/if}
</div>

<!-- Discard warning -->
{#if showDiscardWarning}
	<div class="mx-4 mt-2 flex items-center justify-between rounded-xl bg-surface-2 px-3 py-2.5">
		<span class="text-sm text-txt-secondary">Kasta utkastet?</span>
		<div class="flex items-center gap-2">
			<button
				onclick={() => showDiscardWarning = false}
				class="rounded-lg px-3 py-1.5 text-sm text-txt-secondary hover:bg-surface-3 transition-colors"
			>Avbryt</button>
			<button
				onclick={doCancel}
				class="rounded-lg bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-500/20 transition-colors"
			>Kasta</button>
		</div>
	</div>
{/if}

<!-- Input widget (textarea + send) -->
<div class="px-3 pb-3 pt-2 {isBottomBar ? '' : 'safe-bottom sticky bottom-0 pb-5 bg-surface-1 md:bg-transparent'}">
	<div class="flex flex-col rounded-2xl bg-surface-1 ring-1 ring-surface-5 focus-within:ring-1 focus-within:ring-primary {isBottomBar ? '' : 'md:bg-surface-1/80 md:ring-surface-5/80 md:focus-within:ring-primary'}">
		<textarea
			bind:this={textareaEl}
			bind:value={body}
			onkeydown={handleKeydown}
			oninput={autoGrow}
			rows={isBottomBar ? 2 : 3}
			placeholder={isComment ? 'Skriv din kommentar...' : 'Skriv ditt inlägg...'}
			class="w-full resize-none bg-transparent px-3 pt-3 pb-1 text-txt placeholder:text-txt-muted focus:outline-none {isBottomBar ? 'text-sm' : 'text-base md:text-sm'}"
			style="max-height: {isBottomBar ? 180 : 250}px;"
		></textarea>
		<div class="flex items-center justify-between px-2 pb-2">
			<span class="text-xs text-txt-muted pl-1">
				Ctrl+Enter för att skicka
			</span>
			<button
				onclick={handleSend}
				disabled={sent || !body.trim()}
				class="flex h-9 w-9 items-center justify-center rounded-full bg-primary hover:bg-primary-hover text-txt-inverse active:bg-primary-active disabled:opacity-30 transition-colors"
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
