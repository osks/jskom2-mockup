<script lang="ts">
	import StreamView from '$lib/components/StreamView.svelte';
	import ComposeBar from '$lib/components/ComposeBar.svelte';
</script>

<svelte:head>
	<title>Läsa — jskom2</title>
</svelte:head>

<div class="flex h-full flex-col">
	<StreamView />
	<ComposeBar />
</div>
