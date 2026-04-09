<script lang="ts">
	import { tick } from 'svelte';
	import { readingState, clearCommentTo, cancelCompose, setComposeBody } from '$lib/stores/reading';
	import { conferences, getTextById, getUserById, getConferenceById } from '$lib/data';
	import { ArrowUp, Check, X, Pencil, SplitSquareVertical, Minimize2 } from 'lucide-svelte';
	import type { TextInfo } from '$lib/types';

	interface Props {
		commentToText: TextInfo | null;
		/** 'bottombar' = desktop bottom bar, 'overlay' = mobile sheet / desktop full-screen */
		variant?: 'bottombar' | 'overlay';
		showCancel?: boolean;
		showHeader?: boolean;
		/** Pre-fill recipient conference ID */
		initialRecipient?: number | null;
		onSend?: () => void;
		onCancel?: () => void;
		onExpand?: (() => void) | null;
		onCollapse?: (() => void) | null;
	}

	let {
		commentToText,
		variant = 'overlay',
		showCancel = true,
		showHeader = true,
		initialRecipient = null,
		onSend,
		onCancel,
		onExpand = null,
		onCollapse = null
	}: Props = $props();

	const isBottomBar = $derived(variant === 'bottombar');
	const isExpanded = $derived(!!onCollapse);

	const commentToAuthor = $derived(
		commentToText ? getUserById(commentToText.author) : null
	);

	const isComment = $derived(!!commentToText);

	const initRecipient = initialRecipient;
	const initIsComment = !!commentToText;
	let recipients = $state<number[]>(initRecipient ? [initRecipient] : [1]);
	let subject = $state('');
	let body = $state($readingState.composeBody || '');
	let sent = $state(false);
	let showMeta = $state(!initIsComment);
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

	// Focus textarea on mount for new text
	$effect(() => {
		if (!commentToText) {
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
		if (isBottomBar && !isExpanded) return;
		const el = e.target as HTMLTextAreaElement;
		el.style.height = 'auto';
		el.style.height = el.scrollHeight + 'px';
	}

	function updateRecipient(index: number, value: number) {
		recipients = recipients.map((r, i) => i === index ? value : r);
	}
</script>

{#if showHeader}
<!-- Header -->
<div class="flex items-center justify-between pt-3 pb-1 {isBottomBar ? '' : 'px-4'}">
	<h2 class="text-sm font-medium text-txt-secondary">
		{#if isComment}
			Kommentera
		{:else}
			Nytt inlägg
		{/if}
	</h2>
	<div class="flex items-center gap-1">
		{#if showDiscardWarning}
			<button
				onclick={doCancel}
				class="flex h-8 items-center rounded-full bg-accent px-3 text-sm font-medium text-txt-inverse hover:bg-accent-hover active:bg-accent-active transition-colors"
			>Kasta</button>
			<button
				onclick={() => showDiscardWarning = false}
				class="flex h-8 items-center rounded-full px-3 text-sm text-txt-muted ring-1 ring-edge hover:bg-surface-3/50 hover:text-txt-secondary transition-colors"
			>Avbryt</button>
		{:else}
			{#if onCollapse}
				<button
					onclick={onCollapse}
					class="flex h-8 w-8 items-center justify-center rounded-full text-txt-muted hover:bg-surface-3/50 hover:text-txt-secondary transition-colors {isBottomBar ? 'ring-1 ring-edge' : ''}"
					aria-label="Minimera"
				>
					<Minimize2 size={14} />
				</button>
			{:else if onExpand}
				<button
					onclick={onExpand}
					class="flex h-8 w-8 items-center justify-center rounded-full text-txt-muted hover:bg-surface-3/50 hover:text-txt-secondary transition-colors {isBottomBar ? 'ring-1 ring-edge' : ''}"
					aria-label="Utökad"
				>
					<SplitSquareVertical size={14} />
				</button>
			{/if}
			{#if showCancel}
				<button
					onclick={handleCancel}
					class="flex items-center justify-center rounded-full text-txt active:bg-surface-4/50 {isBottomBar ? 'h-8 w-8 ring-1 ring-edge' : 'h-12 w-12 bg-surface-4/70 backdrop-blur-md ring-[1.5px] ring-surface-1/80 shadow-[0_0_0_0.5px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.08)] md:h-8 md:w-8 md:bg-transparent md:ring-0 md:shadow-none'}"
				>
					<X size={18} />
				</button>
			{/if}
		{/if}
	</div>
</div>
{/if}

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
<div class="mt-2 {isBottomBar ? '' : 'mx-4'}">
	{#if showMeta}
		<!-- Editable fields -->
		<div class="space-y-2 py-0.5">
			{#each recipients as recipientId, i}
				<div class="flex items-center gap-2">
					<span class="shrink-0 text-sm text-txt-muted">@</span>
					<select
						value={recipientId}
						onchange={(e) => updateRecipient(i, Number((e.target as HTMLSelectElement).value))}
						class="flex-1 rounded-full bg-transparent px-3 py-1.5 text-sm text-txt-secondary ring-1 ring-edge-strong hover:ring-edge-focus focus:outline-none focus:ring-[1.5px] focus:ring-edge-focus"
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
					class="flex-1 rounded-full bg-transparent px-3 py-1.5 text-sm ring-1 ring-edge-strong hover:ring-edge-focus focus:outline-none focus:ring-[1.5px] focus:ring-edge-focus"
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

<!-- Input widget (textarea + send) -->
<div class="pt-2 {isBottomBar ? '' : 'px-4'} {isExpanded ? 'flex-1 flex flex-col min-h-0 pb-3' : 'pb-6'} {!isBottomBar && !isExpanded ? 'safe-bottom sticky bottom-0 bg-surface-1 md:bg-transparent' : ''}">
	<div class="flex flex-col rounded-3xl bg-surface-1 ring-1 ring-edge-strong focus-within:ring-1 focus-within:ring-edge-focus {isExpanded ? 'flex-1 min-h-0' : ''} {isBottomBar && !isExpanded ? '' : 'md:bg-surface-1/80 md:ring-edge-strong md:focus-within:ring-edge-focus'}">
		<textarea
			bind:this={textareaEl}
			bind:value={body}
			onkeydown={handleKeydown}
			oninput={autoGrow}
			rows={4}
			placeholder={isComment ? 'Skriv din kommentar...' : 'Skriv ditt inlägg...'}
			class="w-full resize-none bg-transparent px-5 pt-4 pb-1 text-txt placeholder:text-txt-muted focus:outline-none {isBottomBar ? 'text-sm' : 'text-base md:text-sm'} {isExpanded ? 'flex-1' : ''}"
			style={isExpanded || !isBottomBar ? '' : 'max-height: 180px;'}
		></textarea>
		<div class="flex items-center justify-between px-4 pb-4 pt-1">
			<span class="text-xs text-txt-muted pl-1">
				Ctrl/⌘+Enter för att skicka
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
