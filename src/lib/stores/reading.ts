import { writable, derived, get } from 'svelte/store';
import { getMemberships, getTextsInConference, getTextById, getUnreadTexts } from '$lib/data';
import type { TextInfo } from '$lib/types';

export interface StreamItem {
	type: 'text' | 'conference-divider' | 'unread-divider';
	textId?: number;
	conferenceId?: number;
}

interface ReadingState {
	userId: number | null;
	streamItems: StreamItem[];
	firstUnreadIndex: number;
	commentTo: number | null;
}

export const readingState = writable<ReadingState>({
	userId: null,
	streamItems: [],
	firstUnreadIndex: -1,
	commentTo: null
});

export function initReading(userId: number) {
	const memberships = getMemberships(userId);
	const items: StreamItem[] = [];
	let firstUnreadIndex = -1;

	for (const m of memberships) {
		const allTexts = getTextsInConference(m.conferenceId);
		if (allTexts.length === 0) continue;

		// Conference divider
		items.push({ type: 'conference-divider', conferenceId: m.conferenceId });

		const readTexts = allTexts.filter((t) => t.id <= m.lastRead);
		const unreadTexts = allTexts.filter((t) => t.id > m.lastRead);

		// Show last few read texts for context
		const contextTexts = readTexts.slice(-3);
		for (const t of contextTexts) {
			items.push({ type: 'text', textId: t.id, conferenceId: m.conferenceId });
		}

		// Unread divider
		if (unreadTexts.length > 0) {
			if (firstUnreadIndex === -1) {
				firstUnreadIndex = items.length;
			}
			items.push({ type: 'unread-divider', conferenceId: m.conferenceId });

			for (const t of unreadTexts) {
				items.push({ type: 'text', textId: t.id, conferenceId: m.conferenceId });
			}
		}
	}

	readingState.set({
		userId: userId,
		streamItems: items,
		firstUnreadIndex,
		commentTo: null
	});
}

export function setCommentTo(textId: number | null) {
	readingState.update((s) => ({ ...s, commentTo: textId }));
}

export function clearCommentTo() {
	readingState.update((s) => ({ ...s, commentTo: null }));
}
