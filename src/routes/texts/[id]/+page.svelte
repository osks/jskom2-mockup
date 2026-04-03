<script lang="ts">
	import { page } from '$app/state';
	import { getTextById, getCommentTree } from '$lib/data';
	import TextThread from '$lib/components/TextThread.svelte';
	import { base } from '$app/paths';

	const textId = $derived(Number(page.params.id));
	const text = $derived(getTextById(textId));

	// Find the root of the thread
	function findRoot(id: number): number {
		const t = getTextById(id);
		if (!t || !t.commentTo || t.commentTo.length === 0) return id;
		return findRoot(t.commentTo[0]);
	}

	const rootId = $derived(text ? findRoot(textId) : textId);
</script>

<svelte:head>
	<title>{text?.subject ?? 'Text'} — jskom2</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-6">
	{#if text}
		<div class="mb-4">
			<h1 class="text-sm text-gray-500">
				Tråd startad med
				<a href="{base}/texts/{rootId}" class="font-mono text-lyskom-600 hover:underline">text {rootId}</a>
			</h1>
		</div>

		<div class="space-y-3">
			<TextThread textId={rootId} highlightId={textId} />
		</div>
	{:else}
		<p class="text-gray-500">Texten hittades inte.</p>
	{/if}
</div>
