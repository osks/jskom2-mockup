import { writable, derived, get } from 'svelte/store';
import { getMemberships, getUnreadTexts, getTextById } from '$lib/data';
import type { TextInfo } from '$lib/types';

interface ReadingState {
	currentConference: number | null;
	currentText: TextInfo | null;
	queue: number[];
	conferenceQueue: number[];
}

export const readingState = writable<ReadingState>({
	currentConference: null,
	currentText: null,
	queue: [],
	conferenceQueue: []
});

export function initReading(userId: number) {
	const memberships = getMemberships(userId);
	const confs = memberships.filter((m) => m.unread > 0).map((m) => m.conferenceId);
	readingState.set({
		currentConference: null,
		currentText: null,
		queue: [],
		conferenceQueue: confs
	});
}

export function nextConference() {
	const state = get(readingState);
	const nextConf = state.conferenceQueue[0];
	if (!nextConf) {
		readingState.update((s) => ({ ...s, currentConference: null, currentText: null, queue: [] }));
		return;
	}

	// Build reading queue: texts in order, following comment chains
	const unread = getUnreadTexts(8, nextConf);
	const queue = buildReadingOrder(unread);

	readingState.update((s) => ({
		...s,
		currentConference: nextConf,
		conferenceQueue: s.conferenceQueue.slice(1),
		queue: queue.slice(1),
		currentText: queue.length > 0 ? getTextById(queue[0]) ?? null : null
	}));
}

export function nextText() {
	readingState.update((s) => {
		if (s.queue.length === 0) {
			return { ...s, currentText: null };
		}
		const nextId = s.queue[0];
		return {
			...s,
			queue: s.queue.slice(1),
			currentText: getTextById(nextId) ?? null
		};
	});
}

export function skipText() {
	nextText();
}

function buildReadingOrder(texts: TextInfo[]): number[] {
	// Simple order: root texts first, then follow comment chains depth-first
	const ids = new Set(texts.map((t) => t.id));
	const roots = texts.filter(
		(t) => !t.commentTo || t.commentTo.length === 0 || !t.commentTo.some((id) => ids.has(id))
	);
	const visited = new Set<number>();
	const order: number[] = [];

	function visit(id: number) {
		if (visited.has(id) || !ids.has(id)) return;
		visited.add(id);
		order.push(id);
		const text = getTextById(id);
		if (text?.commentedIn) {
			for (const childId of text.commentedIn) {
				visit(childId);
			}
		}
	}

	for (const root of roots) {
		visit(root.id);
	}
	// Add any remaining texts not reached via tree traversal
	for (const t of texts) {
		if (!visited.has(t.id)) order.push(t.id);
	}
	return order;
}
