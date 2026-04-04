<script lang="ts">
	import { sessions } from '$lib/data';
	import { currentUser } from '$lib/stores/auth';
	import SessionRow from '$lib/components/SessionRow.svelte';
</script>

<svelte:head>
	<title>Vilka — jskom2</title>
</svelte:head>

<div class="mx-auto max-w-2xl bg-white">
	<!-- Section header -->
	<div class="sticky top-14 md:top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-2">
		<span class="text-xs font-medium text-gray-500">
			{sessions.length} {sessions.length === 1 ? 'session' : 'sessioner'} aktiva
		</span>
	</div>

	{#each sessions as session}
		<SessionRow
			{session}
			isCurrentUser={$currentUser?.id === session.userId}
		/>
	{/each}
</div>
