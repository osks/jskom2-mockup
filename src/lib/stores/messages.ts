import { writable } from 'svelte/store';
import type { PersonalMessage } from '$lib/types';

export const personalMessages = writable<PersonalMessage[]>([]);

export function addMessage(msg: PersonalMessage) {
	personalMessages.update((msgs) => [...msgs, msg]);
}

export function dismissMessage(index: number) {
	personalMessages.update((msgs) => msgs.filter((_, i) => i !== index));
}
