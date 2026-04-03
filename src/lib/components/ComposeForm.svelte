<script lang="ts">
	import { conferences, getTextById } from '$lib/data';
	import { Send, X } from 'lucide-svelte';

	interface Props {
		commentTo?: number;
		recipientConference?: number;
	}

	let { commentTo, recipientConference }: Props = $props();

	const parentText = $derived(commentTo ? getTextById(commentTo) : null);
	const defaultConference = $derived(recipientConference ?? parentText?.recipients[0] ?? 1);
	const defaultSubject = $derived(parentText ? `Re: ${parentText.subject.replace(/^Re: /, '')}` : '');

	let selectedConference = $state(0);
	let subject = $state('');
	let body = $state('');
	let sent = $state(false);
	let initialized = $state(false);

	$effect(() => {
		if (!initialized) {
			selectedConference = defaultConference;
			subject = defaultSubject;
			initialized = true;
		}
	});

	function handleSend() {
		sent = true;
		setTimeout(() => {
			sent = false;
			body = '';
		}, 2000);
	}
</script>

<div class="rounded-lg border border-gray-200 bg-white shadow-sm">
	<div class="border-b border-gray-100 px-5 py-4 space-y-3">
		<!-- Recipient -->
		<div class="flex items-center gap-2">
			<label for="recipient" class="w-24 text-sm font-medium text-gray-500 shrink-0">Mottagare:</label>
			<select
				id="recipient"
				bind:value={selectedConference}
				class="flex-1 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm"
			>
				{#each conferences as conf}
					<option value={conf.id}>{conf.name}</option>
				{/each}
			</select>
		</div>

		<!-- Comment to -->
		{#if commentTo}
			<div class="flex items-center gap-2">
				<span class="w-24 text-sm font-medium text-gray-500 shrink-0">Kommentar till:</span>
				<a href="/texts/{commentTo}" class="font-mono text-sm text-lyskom-600 hover:underline">
					text {commentTo}
				</a>
			</div>
		{/if}

		<!-- Subject -->
		<div class="flex items-center gap-2">
			<label for="subject" class="w-24 text-sm font-medium text-gray-500 shrink-0">Ärende:</label>
			<input
				id="subject"
				type="text"
				bind:value={subject}
				class="flex-1 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm"
				placeholder="Ämnesrad..."
			/>
		</div>
	</div>

	<!-- Separator -->
	<div class="px-5 py-1 text-xs text-gray-400 bg-gray-50 border-b border-gray-100">
		Skriv nedan. Sända=Ctrl+Enter
	</div>

	<!-- Body -->
	<div class="px-5 py-4">
		<textarea
			bind:value={body}
			rows={10}
			class="w-full font-mono text-sm leading-relaxed text-gray-800 resize-y outline-none placeholder:text-gray-400"
			placeholder="Skriv ditt inlägg här..."
		></textarea>
	</div>

	<!-- Actions -->
	<div class="border-t border-gray-100 px-5 py-3 flex items-center gap-2">
		<button
			onclick={handleSend}
			disabled={sent}
			class="inline-flex items-center gap-1.5 rounded-md bg-lyskom-600 px-4 py-2 text-sm font-medium text-white hover:bg-lyskom-700 disabled:opacity-50 transition-colors"
		>
			<Send size={14} />
			{sent ? 'Skickat!' : 'Skicka'}
		</button>
		<a
			href="/"
			class="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors"
		>
			<X size={14} />
			Avbryt
		</a>
	</div>
</div>
