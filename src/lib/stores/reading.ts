import { writable, get } from 'svelte/store';
import { getMemberships, getUnreadTexts, getTextById, getConferenceById } from '$lib/data';
import type { TextInfo } from '$lib/types';

// A read-info entry in the reading list, inspired by the elisp client
interface ReadEntry {
	type: 'conf' | 'comment';
	conferenceId: number;
	textIds: number[];
	// For 'comment' type: the text these are comments to
	commentToId?: number;
}

// An item already shown in the reading buffer (session history)
export interface BufferItem {
	kind: 'text' | 'conference-enter';
	textId?: number;
	conferenceId?: number;
	conferenceUnread?: number;
}

// What the next action will do
export type NextAction =
	| { type: 'next-text'; label: string }
	| { type: 'next-comment'; label: string; commentToId: number }
	| { type: 'next-conf'; label: string; conferenceId: number; conferenceName: string }
	| { type: 'all-done'; label: string };

interface ReadingState {
	userId: number | null;
	// The append-only buffer of already-displayed items
	buffer: BufferItem[];
	// Active reading queue (current conference + comment chains pushed in front)
	readingList: ReadEntry[];
	// Conferences still to read, sorted by priority desc
	todoList: ReadEntry[];
	// Current conference being read
	currentConference: number | null;
	// What pressing "next" will do
	nextAction: NextAction;
	// The text currently visible / receiving actions
	activeTextId: number | null;
	// For the compose bar
	commentTo: number | null;
	composingNew: boolean;
	// Desktop: inline compose expanded to full-screen overlay
	composeExpanded: boolean;
	// Shared compose body text (persists across inline <-> expanded transitions)
	composeBody: string;
}

export const readingState = writable<ReadingState>({
	userId: null,
	buffer: [],
	readingList: [],
	todoList: [],
	currentConference: null,
	nextAction: { type: 'all-done', label: 'Inga olästa texter' },
	activeTextId: null,
	commentTo: null,
	composingNew: false,
	composeExpanded: false,
	composeBody: ''
});

// Set of text IDs that have been read this session (to avoid re-reading)
let sessionRead = new Set<number>();

export function initReading(userId: number) {
	sessionRead = new Set<number>();
	const memberships = getMemberships(userId); // already sorted by priority desc

	const todoList: ReadEntry[] = [];
	for (const m of memberships) {
		const unreads = getUnreadTexts(userId, m.conferenceId);
		if (unreads.length === 0) continue;
		todoList.push({
			type: 'conf',
			conferenceId: m.conferenceId,
			textIds: unreads.map((t) => t.id)
		});
	}

	readingState.set({
		userId: userId,
		buffer: [],
		readingList: [],
		todoList,
		currentConference: null,
		nextAction: computeNextAction([], todoList, null),
		activeTextId: null,
		commentTo: null,
		composingNew: false,
		composeExpanded: false,
		composeBody: ''
	});
}

function computeNextAction(
	readingList: ReadEntry[],
	todoList: ReadEntry[],
	currentConference: number | null
): NextAction {
	// Check reading list first
	if (readingList.length > 0) {
		const entry = readingList[0];
		const nextId = entry.textIds.find((id) => !sessionRead.has(id));
		if (nextId !== undefined) {
			if (entry.type === 'comment') {
				return {
					type: 'next-comment',
					label: 'Läs nästa kommentar',
					commentToId: entry.commentToId!
				};
			}
			return { type: 'next-text', label: 'Läs nästa text' };
		}
	}

	// Check todo list
	if (todoList.length > 0) {
		const next = todoList[0];
		const conf = getConferenceById(next.conferenceId);
		return {
			type: 'next-conf',
			label: `Gå till nästa möte`,
			conferenceId: next.conferenceId,
			conferenceName: conf?.name ?? `Möte ${next.conferenceId}`
		};
	}

	return { type: 'all-done', label: 'Inga olästa texter' };
}

// Find the oldest unread ancestor of a text (walk up comment chain)
function findOldestUnreadAncestor(textId: number, unreadSet: Set<number>): number {
	const text = getTextById(textId);
	if (!text || !text.commentTo || text.commentTo.length === 0) return textId;

	for (const parentId of text.commentTo) {
		if (unreadSet.has(parentId) && !sessionRead.has(parentId)) {
			// Parent is unread, recurse up
			return findOldestUnreadAncestor(parentId, unreadSet);
		}
	}
	return textId;
}

// After showing a text, push its unread comments to the front of the reading list (depth-first)
function followComments(textId: number, conferenceId: number, unreadSet: Set<number>): ReadEntry | null {
	const text = getTextById(textId);
	if (!text || !text.commentedIn || text.commentedIn.length === 0) return null;

	const unreadComments = text.commentedIn.filter(
		(id) => unreadSet.has(id) && !sessionRead.has(id)
	);
	if (unreadComments.length === 0) return null;

	return {
		type: 'comment',
		conferenceId,
		textIds: unreadComments,
		commentToId: textId
	};
}

export function advanceReading() {
	readingState.update((s) => {
		if (!s.userId) return s;

		let { buffer, readingList, todoList, currentConference } = s;
		// Clone arrays for mutation
		readingList = [...readingList];
		todoList = [...todoList];
		buffer = [...buffer];

		// If reading list is empty, enter next conference
		if (readingList.length === 0 || !readingList.some((e) => e.textIds.some((id) => !sessionRead.has(id)))) {
			if (todoList.length === 0) {
				return {
					...s,
					buffer,
					readingList: [],
					todoList: [],
					nextAction: { type: 'all-done', label: 'Inga olästa texter' }
				};
			}

			// Enter next conference
			const confEntry = todoList.shift()!;
			readingList = [confEntry];
			currentConference = confEntry.conferenceId;

			const unreadCount = confEntry.textIds.filter((id) => !sessionRead.has(id)).length;
			buffer.push({
				kind: 'conference-enter',
				conferenceId: confEntry.conferenceId,
				conferenceUnread: unreadCount
			});

			return {
				...s,
				buffer,
				readingList,
				todoList,
				currentConference,
				nextAction: computeNextAction(readingList, todoList, currentConference)
			};
		}

		// Find next text to display
		let nextTextId: number | undefined;
		while (readingList.length > 0) {
			const entry = readingList[0];
			nextTextId = entry.textIds.find((id) => !sessionRead.has(id));
			if (nextTextId !== undefined) break;
			// This entry is exhausted, remove it
			readingList.shift();
		}

		if (nextTextId === undefined) {
			// Shouldn't happen, but handle it
			return {
				...s,
				buffer,
				readingList,
				todoList,
				currentConference,
				nextAction: computeNextAction(readingList, todoList, currentConference)
			};
		}

		// Build the set of all unread text IDs across the current conference entries
		const unreadSet = new Set<number>();
		for (const entry of readingList) {
			for (const id of entry.textIds) {
				if (!sessionRead.has(id)) unreadSet.add(id);
			}
		}

		// Find oldest unread ancestor
		const ancestorId = findOldestUnreadAncestor(nextTextId, unreadSet);
		const textToShow = ancestorId !== nextTextId && !sessionRead.has(ancestorId) ? ancestorId : nextTextId;

		// Mark as read
		sessionRead.add(textToShow);

		// Remove from current entry's textIds
		for (const entry of readingList) {
			const idx = entry.textIds.indexOf(textToShow);
			if (idx !== -1) {
				entry.textIds = entry.textIds.filter((id) => id !== textToShow);
				break;
			}
		}

		// Clean up empty entries
		readingList = readingList.filter((e) => e.textIds.some((id) => !sessionRead.has(id)));

		// Add to buffer
		buffer.push({ kind: 'text', textId: textToShow, conferenceId: currentConference ?? undefined });

		// Follow comments (depth-first): push comment entry to front
		const commentEntry = followComments(textToShow, currentConference ?? 0, unreadSet);
		if (commentEntry) {
			readingList.unshift(commentEntry);
		}

		return {
			...s,
			buffer,
			readingList,
			todoList,
			currentConference,
			nextAction: computeNextAction(readingList, todoList, currentConference)
		};
	});
}

export function setCommentTo(textId: number | null) {
	readingState.update((s) => ({ ...s, commentTo: textId }));
}

export function clearCommentTo() {
	readingState.update((s) => ({ ...s, commentTo: null, composeExpanded: false, composeBody: '' }));
}

export function startCompose() {
	readingState.update((s) => ({ ...s, composingNew: true, commentTo: null }));
}

export function cancelCompose() {
	readingState.update((s) => ({ ...s, composingNew: false, composeExpanded: false, composeBody: '' }));
}

export function expandCompose() {
	readingState.update((s) => ({ ...s, composeExpanded: true }));
}

export function collapseCompose() {
	readingState.update((s) => ({ ...s, composeExpanded: false }));
}

export function setComposeBody(body: string) {
	readingState.update((s) => ({ ...s, composeBody: body }));
}

export function setActiveText(textId: number | null) {
	readingState.update((s) => ({ ...s, activeTextId: textId }));
}

// Återse: show a text in the reader (add to buffer as if it were next)
export function återseText(textId: number) {
	const text = getTextById(textId);
	if (!text) return;

	readingState.update((s) => {
		const buffer = [...s.buffer];
		buffer.push({ kind: 'text', textId, conferenceId: s.currentConference ?? undefined });
		return { ...s, buffer };
	});
}
