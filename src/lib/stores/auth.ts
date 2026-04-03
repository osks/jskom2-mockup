import { writable } from 'svelte/store';
import type { Person } from '$lib/types';
import { getUserById } from '$lib/data';

export const currentUser = writable<Person | null>(null);

export function login(userId: number) {
	const user = getUserById(userId);
	if (user) currentUser.set(user);
}

export function logout() {
	currentUser.set(null);
}
