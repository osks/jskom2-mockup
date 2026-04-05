import { writable } from 'svelte/store';

export const pageTitle = writable<string>('');
export const pageSubtitle = writable<string>('');
