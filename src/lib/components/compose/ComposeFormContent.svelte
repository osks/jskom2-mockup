<script lang="ts">
	import { ArrowUp, Check, Pencil } from 'lucide-svelte';
	import type { ComposeState } from './composeState.svelte.ts';

	interface Props {
		compose: ComposeState;
		/** Extra classes on the textarea */
		textareaClass?: string;
		/** Extra classes on the outer meta wrapper */
		metaClass?: string;
	}

	let { compose, textareaClass = '', metaClass = '' }: Props = $props();
</script>

<!-- Conference + subject -->
<div class={metaClass}>
	{#if compose.showMeta}
		<!-- Editable fields -->
		<div class="space-y-2 py-0.5">
			{#each compose.recipients as recipientId, i}
				<div class="flex items-center gap-2">
					<span class="shrink-0 text-sm text-txt-muted">@</span>
					<select
						value={recipientId}
						onchange={(e) => compose.updateRecipient(i, Number((e.target as HTMLSelectElement).value))}
						class="flex-1 rounded-full bg-transparent px-3 py-1.5 text-sm text-txt-secondary ring-1 ring-edge-strong hover:ring-edge-focus focus:outline-none focus:ring-[1.5px] focus:ring-edge-focus"
					>
						{#each compose.conferences as conf}
							<option value={conf.id}>{conf.name}</option>
						{/each}
					</select>
				</div>
			{/each}
			<div class="flex items-center gap-2">
				<span class="shrink-0 text-sm text-txt-muted">Ärende</span>
				<input
					type="text"
					bind:value={compose.subject}
					placeholder="Ärende..."
					class="flex-1 rounded-full bg-transparent px-3 py-1.5 text-sm ring-1 ring-edge-strong hover:ring-edge-focus focus:outline-none focus:ring-[1.5px] focus:ring-edge-focus"
				/>
			</div>
		</div>
	{:else}
		<!-- Static display -->
		<div class="flex items-start justify-between">
			<div class="flex flex-col gap-0.5">
				{#each compose.recipientNames as name}
					<div class="text-sm text-txt-secondary">
						<span class="text-txt-muted">@</span> {name}
					</div>
				{/each}
				<div class="text-sm text-txt-secondary">
					Ärende: {compose.subject || 'Inget ärende'}
				</div>
			</div>
			<button
				onclick={() => compose.showMeta = true}
				class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-txt-muted hover:bg-surface-3/50 hover:text-txt-secondary transition-colors"
				aria-label="Redigera"
			>
				<Pencil size={14} />
			</button>
		</div>
	{/if}
</div>

<!-- Textarea + send button (inside a rounded container controlled by parent) -->
<textarea
	bind:this={compose.textareaEl}
	bind:value={compose.body}
	onkeydown={compose.handleKeydown}
	rows={4}
	placeholder={compose.isComment ? 'Skriv din kommentar...' : 'Skriv ditt inlägg...'}
	class="w-full resize-none bg-transparent px-5 pt-4 pb-1 text-txt placeholder:text-txt-muted focus:outline-none {textareaClass}"
></textarea>
<div class="flex items-center justify-between px-4 pb-4 pt-1">
	<span class="text-xs text-txt-muted pl-1">
		Ctrl/⌘+Enter för att skicka
	</span>
	<button
		onclick={compose.handleSend}
		disabled={compose.sent || !compose.body.trim()}
		class="flex h-9 w-9 items-center justify-center rounded-full bg-primary hover:bg-primary-hover text-txt-inverse active:bg-primary-active disabled:opacity-30 transition-colors"
	>
		{#if compose.sent}
			<Check size={18} />
		{:else}
			<ArrowUp size={18} />
		{/if}
	</button>
</div>
