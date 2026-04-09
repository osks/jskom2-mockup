import { tick } from 'svelte';
import { get } from 'svelte/store';
import { readingState, clearCommentTo, cancelCompose, setComposeBody } from '$lib/stores/reading';
import { conferences, getConferenceById, getUserById } from '$lib/data';
import type { TextInfo } from '$lib/types';

export interface ComposeStateOptions {
	commentToText: TextInfo | null;
	initialRecipient?: number | null;
	onSend?: () => void;
	onCancel?: () => void;
}

export function createComposeState(opts: ComposeStateOptions) {
	const { commentToText, initialRecipient = null, onSend, onCancel } = opts;

	const isComment = $derived(!!commentToText);
	const commentToAuthor = $derived(
		commentToText ? getUserById(commentToText.author) : null
	);

	let recipients = $state<number[]>(initialRecipient ? [initialRecipient] : [1]);
	let subject = $state('');
	let body = $state(get(readingState).composeBody || '');
	let sent = $state(false);
	let showMeta = $state(!commentToText);
	let showDiscardWarning = $state(false);
	let textareaEl = $state<HTMLTextAreaElement | undefined>();

	const recipientNames = $derived(
		recipients.map((id) => getConferenceById(id)?.name ?? `Möte ${id}`)
	);

	// Sync body to shared state
	$effect(() => {
		setComposeBody(body);
	});

	// Update defaults when commentTo changes
	$effect(() => {
		if (commentToText) {
			recipients = [...commentToText.recipients];
			subject = `Re: ${commentToText.subject.replace(/^Re: /, '')}`;
			showMeta = false;
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
			onSend?.();
		}, 1500);
	}

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

	function updateRecipient(index: number, value: number) {
		recipients = recipients.map((r, i) => i === index ? value : r);
	}

	function focusTextarea() {
		tick().then(() => textareaEl?.focus());
	}

	return {
		get recipients() { return recipients; },
		set recipients(v) { recipients = v; },
		get subject() { return subject; },
		set subject(v) { subject = v; },
		get body() { return body; },
		set body(v) { body = v; },
		get sent() { return sent; },
		get showMeta() { return showMeta; },
		set showMeta(v) { showMeta = v; },
		get showDiscardWarning() { return showDiscardWarning; },
		set showDiscardWarning(v) { showDiscardWarning = v; },
		get textareaEl() { return textareaEl; },
		set textareaEl(v) { textareaEl = v; },

		get isComment() { return isComment; },
		get commentToAuthor() { return commentToAuthor; },
		get recipientNames() { return recipientNames; },

		conferences,
		commentToText,

		handleSend,
		handleCancel,
		doCancel,
		handleKeydown,
		updateRecipient,
		focusTextarea,
	};
}

export type ComposeState = ReturnType<typeof createComposeState>;
