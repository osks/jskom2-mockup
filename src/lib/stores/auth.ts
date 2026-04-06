import { writable, derived, get } from 'svelte/store';
import type { Person, ServerConnection } from '$lib/types';
import { getUserById } from '$lib/data';

export const connections = writable<ServerConnection[]>([]);
export const activeConnectionId = writable<string | null>(null);

export const activeConnection = derived(
	[connections, activeConnectionId],
	([$connections, $activeConnectionId]) =>
		$connections.find((c) => c.id === $activeConnectionId) ?? null
);

// Backward-compatible: derive currentUser from active connection
export const currentUser = derived(activeConnection, ($conn) =>
	$conn ? getUserById($conn.userId) ?? null : null
);

export function login(userId: number, serverName: string) {
	const user = getUserById(userId);
	if (!user) return;

	const id = `${serverName}:${userId}`;

	connections.update((conns) => {
		// Don't add duplicate
		if (conns.some((c) => c.id === id)) return conns;
		return [...conns, { id, serverName, userId, userName: user.name }];
	});

	activeConnectionId.set(id);
}

export function switchConnection(id: string) {
	activeConnectionId.set(id);
}

export function disconnectConnection(id: string) {
	connections.update((conns) => conns.filter((c) => c.id !== id));
	const remaining = get(connections);
	activeConnectionId.update((current) =>
		current === id ? (remaining[0]?.id ?? null) : current
	);
}

export function logout() {
	connections.set([]);
	activeConnectionId.set(null);
}
