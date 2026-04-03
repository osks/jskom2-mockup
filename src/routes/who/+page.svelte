<script lang="ts">
	import { sessions } from '$lib/data';
	import { currentUser } from '$lib/stores/auth';
	import SessionRow from '$lib/components/SessionRow.svelte';
</script>

<svelte:head>
	<title>Vilka — jskom2</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-6">
	<h1 class="text-2xl font-bold text-gray-900">Vilka är inloggade</h1>
	<p class="mt-1 text-sm text-gray-500">
		{sessions.length} {sessions.length === 1 ? 'session' : 'sessioner'} aktiva
	</p>

	<div class="mt-6 space-y-2">
		{#each sessions as session}
			<SessionRow
				{session}
				isCurrentUser={$currentUser?.id === session.userId}
			/>
		{/each}
	</div>
</div>
