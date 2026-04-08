<script lang="ts">
	import { page } from '$app/state';
	import { getTextById } from '$lib/data';
	import { pageTitle } from '$lib/stores/page';
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

	$effect(() => {
		pageTitle.set(rootText?.subject ?? `text ${rootId}`);
	});
</script>

<svelte:head>
	<title>{text?.subject ?? 'Text'} — jskom2</title>
</svelte:head>

<div class="mx-auto max-w-3xl bg-surface-2 pt-below-header">
	<div class="hidden md:block sticky top-0 z-10 bg-surface-2/95 backdrop-blur-sm border-b border-surface-3 px-4 py-2">
		<span class="text-xs font-medium text-txt-secondary">
			Tråd — {rootText?.subject ?? `text ${rootId}`}
		</span>
	</div>

	{#if rootText}
		<TextThread textId={rootId} highlightId={textId} />
	{:else}
		<p class="px-4 py-8 text-center text-sm text-txt-muted">Texten hittades inte.</p>
	{/if}
</div>
