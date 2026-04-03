<script lang="ts">
	import { readingState, nextConference, initReading } from '$lib/stores/reading';
	import { currentUser } from '$lib/stores/auth';
	import { getMemberships } from '$lib/data';
	import ReadingPrompt from '$lib/components/ReadingPrompt.svelte';
	import TextCard from '$lib/components/TextCard.svelte';

	// Auto-enter first conference if not reading yet
	$effect(() => {
		if ($currentUser && !$readingState.currentConference && $readingState.conferenceQueue.length > 0) {
			nextConference();
		}
	});

	const totalUnread = $derived(
		$currentUser
			? getMemberships($currentUser.id).reduce((sum, m) => sum + m.unread, 0)
			: 0
	);
</script>

<svelte:head>
	<title>Läsa — jskom2</title>
</svelte:head>

<ReadingPrompt />

<div class="mx-auto max-w-3xl px-4 py-6">
	{#if $readingState.currentText}
		<TextCard text={$readingState.currentText} />
	{:else if $readingState.conferenceQueue.length === 0}
		<div class="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
			<p class="text-lg font-medium text-gray-700">Inga olästa texter</p>
			<p class="mt-1 text-sm text-gray-500">Du har läst allt. Väntar...</p>
		</div>
	{/if}
</div>
