<script lang="ts">
	import { page } from '$app/state';
	import ComposeForm from '$lib/components/ComposeForm.svelte';

	const commentTo = $derived(
		page.url.searchParams.has('commentTo')
			? Number(page.url.searchParams.get('commentTo'))
			: undefined
	);
	const recipientConference = $derived(
		page.url.searchParams.has('conference')
			? Number(page.url.searchParams.get('conference'))
			: undefined
	);
</script>

<svelte:head>
	<title>Skriv — jskom2</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-6">
	<h1 class="mb-4 text-2xl font-bold text-gray-900">
		{#if commentTo}
			Skriv kommentar
		{:else}
			Skriv nytt inlägg
		{/if}
	</h1>

	<ComposeForm {commentTo} {recipientConference} />
</div>
