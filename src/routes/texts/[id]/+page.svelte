<script lang="ts">
	import { page } from '$app/state';
	import { getTextById } from '$lib/data';
	import TextThread from '$lib/components/TextThread.svelte';

	const textId = $derived(Number(page.params.id));
	const text = $derived(getTextById(textId));

	function findRoot(id: number): number {
		const t = getTextById(id);
		if (!t || !t.commentTo || t.commentTo.length === 0) return id;
		return findRoot(t.commentTo[0]);
	}

	const rootId = $derived(text ? findRoot(textId) : textId);
	const rootText = $derived(getTextById(rootId));
</script>

<svelte:head>
	<title>{text?.subject ?? 'Text'} — jskom2</title>
</svelte:head>

<div class="mx-auto max-w-2xl bg-white">
	<div class="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-2">
		<span class="text-xs font-medium text-gray-500">
			Tråd — {rootText?.subject ?? `text ${rootId}`}
		</span>
	</div>

	{#if rootText}
		<TextThread textId={rootId} highlightId={textId} />
	{:else}
		<p class="px-4 py-8 text-center text-sm text-gray-400">Texten hittades inte.</p>
	{/if}
</div>
