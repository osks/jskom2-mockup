<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { pageTitle } from '$lib/stores/page';
	import ComposeForm from '$lib/components/ComposeForm.svelte';

	const initialConference = $derived(
		page.url.searchParams.has('confNo') ? Number(page.url.searchParams.get('confNo')) : null
	);
	const fromReader = $derived(page.url.searchParams.get('from') === 'reader');

	$effect(() => {
		pageTitle.set('Skriv');
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && fromReader) {
			goto(`${base}/read`);
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head>
	<title>Skriv — jskom2</title>
</svelte:head>

<div class="flex-1 overflow-y-auto hidden md:block">
	<div class="mx-auto w-full max-w-3xl pt-4">
		<ComposeForm
			commentToText={null}
			variant="bottombar"
			showCancel={fromReader}
			onCancel={() => goto(`${base}/read`)}
			initialRecipient={initialConference}
		/>
	</div>
</div>
