<script lang="ts">
	import { page } from '$app/state';
	import { pageTitle } from '$lib/stores/page';
	import { createComposeState } from '$lib/components/compose/composeState.svelte.ts';
	import ComposeFormContent from '$lib/components/compose/ComposeFormContent.svelte';

	const initialConference = $derived(
		page.url.searchParams.has('confNo') ? Number(page.url.searchParams.get('confNo')) : null
	);

	const compose = createComposeState({
		commentToText: null,
		get initialRecipient() { return initialConference; },
	});

	$effect(() => {
		pageTitle.set('Skriv');
		compose.focusTextarea();
	});
</script>

<svelte:head>
	<title>Skriv — jskom2</title>
</svelte:head>

<div class="flex-1 overflow-y-auto hidden md:block">
	<div class="mx-auto w-full max-w-3xl pt-4">
		<!-- Header (no buttons — use sidebar to navigate) -->
		<div class="flex items-center pt-3 pb-1">
			<h2 class="text-sm font-medium text-txt-secondary">Nytt inlägg</h2>
		</div>

		<!-- Form content -->
		<div class="pt-2 pb-6">
			<div class="flex flex-col rounded-3xl bg-surface-1 ring-1 ring-edge-strong focus-within:ring-1 focus-within:ring-edge-focus">
				<ComposeFormContent compose={compose} textareaClass="text-sm" />
			</div>
		</div>
	</div>
</div>
