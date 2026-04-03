<script lang="ts">
	import { getUserById } from '$lib/data';
	import { base } from '$app/paths';

	interface Props {
		userId: number;
		showAvatar?: boolean;
		linked?: boolean;
	}

	let { userId, showAvatar = true, linked = true }: Props = $props();

	const user = $derived(getUserById(userId));
	const initials = $derived(
		user
			? user.name
					.split(' ')
					.map((n) => n[0])
					.join('')
			: '?'
	);

	const colors = [
		'bg-blue-500',
		'bg-emerald-500',
		'bg-amber-500',
		'bg-rose-500',
		'bg-purple-500',
		'bg-cyan-500',
		'bg-orange-500',
		'bg-indigo-500'
	];
	const color = $derived(colors[userId % colors.length]);
</script>

{#if user}
	{#if linked}
		<a href="{base}/users/{userId}" class="inline-flex items-center gap-1.5 hover:underline">
			{#if showAvatar}
				<span
					class="inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium text-white {color}"
				>
					{initials}
				</span>
			{/if}
			<span class="font-medium text-gray-900">{user.name}</span>
		</a>
	{:else}
		<span class="inline-flex items-center gap-1.5">
			{#if showAvatar}
				<span
					class="inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium text-white {color}"
				>
					{initials}
				</span>
			{/if}
			<span class="font-medium text-gray-900">{user.name}</span>
		</span>
	{/if}
{:else}
	<span class="text-gray-400">Okänd användare</span>
{/if}
