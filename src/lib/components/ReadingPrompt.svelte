<script lang="ts">
	import { readingState, nextText, nextConference, skipText } from '$lib/stores/reading';
	import { getConferenceById, getMemberships } from '$lib/data';
	import { ChevronRight, SkipForward, ArrowRight } from 'lucide-svelte';

	const conf = $derived(
		$readingState.currentConference
			? getConferenceById($readingState.currentConference)
			: null
	);
	const remaining = $derived($readingState.queue.length);
	const hasMoreConferences = $derived($readingState.conferenceQueue.length > 0);
</script>

<div class="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur-sm px-4 py-2.5">
	<div class="flex items-center justify-between gap-4">
		<div class="flex items-center gap-2 text-sm">
			{#if conf}
				<a href="/conferences/{conf.id}" class="font-semibold text-lyskom-700 hover:underline">
					{conf.name}
				</a>
				{#if remaining > 0}
					<span class="text-gray-500">— {remaining + 1} olästa</span>
				{/if}
			{:else if hasMoreConferences}
				<span class="text-gray-600">Gå till nästa möte</span>
			{:else}
				<span class="text-gray-500">Inga olästa texter.</span>
			{/if}
		</div>

		<div class="flex items-center gap-1.5">
			{#if $readingState.currentText}
				{#if remaining > 0}
					<button
						onclick={nextText}
						class="inline-flex items-center gap-1 rounded-md bg-lyskom-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-lyskom-700 transition-colors"
					>
						Nästa text
						<ChevronRight size={14} />
					</button>
				{/if}
				<button
					onclick={skipText}
					class="inline-flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors"
				>
					Hoppa över
					<SkipForward size={14} />
				</button>
			{/if}

			{#if !$readingState.currentText || remaining === 0}
				{#if hasMoreConferences}
					<button
						onclick={nextConference}
						class="inline-flex items-center gap-1 rounded-md bg-lyskom-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-lyskom-700 transition-colors"
					>
						Nästa möte
						<ArrowRight size={14} />
					</button>
				{/if}
			{/if}
		</div>
	</div>
</div>
