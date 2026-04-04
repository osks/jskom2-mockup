import { users } from './users';
import { conferences } from './conferences';
import { texts } from './texts';
import { memberships } from './memberships';
import { sessions } from './sessions';
import type { Person, Conference, TextInfo, Membership } from '$lib/types';

export { users, conferences, texts, memberships, sessions };

export function getUserById(id: number): Person | undefined {
	return users.find((u) => u.id === id);
}

export function getConferenceById(id: number): Conference | undefined {
	return conferences.find((c) => c.id === id);
}

export function getTextById(id: number): TextInfo | undefined {
	return texts.find((t) => t.id === id);
}

export function getTextsInConference(confId: number): TextInfo[] {
	return texts
		.filter((t) => t.recipients.includes(confId))
		.sort((a, b) => a.id - b.id);
}

export function getMemberships(userId: number): Membership[] {
	return memberships
		.filter((m) => m.userId === userId)
		.sort((a, b) => b.priority - a.priority);
}

export function getCommentTree(textId: number): TextInfo[] {
	const result: TextInfo[] = [];
	const visited = new Set<number>();

	function findRoot(id: number): number {
		const text = getTextById(id);
		if (!text || !text.commentTo || text.commentTo.length === 0) return id;
		return findRoot(text.commentTo[0]);
	}

	function collect(id: number) {
		if (visited.has(id)) return;
		visited.add(id);
		const text = getTextById(id);
		if (!text) return;
		result.push(text);
		for (const childId of text.commentedIn ?? []) {
			collect(childId);
		}
	}

	const rootId = findRoot(textId);
	collect(rootId);
	return result;
}

export function getUnreadTexts(userId: number, confId: number): TextInfo[] {
	const membership = memberships.find(
		(m) => m.userId === userId && m.conferenceId === confId
	);
	if (!membership) return [];
	return getTextsInConference(confId).filter((t) => t.id > membership.lastRead);
}

const authorColorMap = [
	{ border: 'border-blue-400', text: 'text-blue-700', bg: 'bg-blue-500' },
	{ border: 'border-emerald-400', text: 'text-emerald-700', bg: 'bg-emerald-500' },
	{ border: 'border-amber-400', text: 'text-amber-700', bg: 'bg-amber-500' },
	{ border: 'border-rose-400', text: 'text-rose-700', bg: 'bg-rose-500' },
	{ border: 'border-purple-400', text: 'text-purple-700', bg: 'bg-purple-500' },
	{ border: 'border-cyan-400', text: 'text-cyan-700', bg: 'bg-cyan-500' },
	{ border: 'border-orange-400', text: 'text-orange-700', bg: 'bg-orange-500' },
	{ border: 'border-indigo-400', text: 'text-indigo-700', bg: 'bg-indigo-500' }
];

export function getAuthorColor(userId: number) {
	return authorColorMap[userId % authorColorMap.length];
}

export function formatIdleTime(seconds: number): string {
	if (seconds < 60) return `${seconds}s`;
	if (seconds < 3600) return `${Math.floor(seconds / 60)}min`;
	return `${Math.floor(seconds / 3600)}h`;
}
