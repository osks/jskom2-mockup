<script lang="ts">
	import type { PersonalMessage } from '$lib/types';
	import { getUserById } from '$lib/data';
	import { dismissMessage } from '$lib/stores/messages';
	import { X } from 'lucide-svelte';

	interface Props {
		message: PersonalMessage;
		index: number;
	}

	let { message, index }: Props = $props();

	const sender = $derived(getUserById(message.from));
</script>

<div
	class="animate-in slide-in-from-right w-80 rounded-lg border border-gray-200 bg-white p-4 shadow-lg"
>
	<div class="flex items-start justify-between gap-2">
		<div class="text-xs font-semibold text-lyskom-700">
			Personligt meddelande från {sender?.name ?? 'Okänd'}
		</div>
		<button
			onclick={() => dismissMessage(index)}
			class="shrink-0 text-gray-400 hover:text-gray-600"
		>
			<X size={14} />
		</button>
	</div>
	<div class="mt-1.5 text-sm text-gray-700">{message.body}</div>
	<div class="mt-1.5 text-xs text-gray-400">
		{new Date(message.timestamp).toLocaleTimeString('sv-SE', {
			hour: '2-digit',
			minute: '2-digit'
		})}
	</div>
</div>
