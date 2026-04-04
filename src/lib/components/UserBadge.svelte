<script lang="ts">
	import { getUserById, getAuthorColor } from '$lib/data';
	import { base } from '$app/paths';

	interface Props {
		userId: number;
		showAvatar?: boolean;
		linked?: boolean;
	}

	let { userId, showAvatar = true, linked = true }: Props = $props();

	const user = $derived(getUserById(userId));
	const colors = $derived(getAuthorColor(userId));
	const initials = $derived(
		user
			? user.name
					.split(' ')
					.map((n) => n[0])
					.join('')
			: '?'
	);
</script>

{#if user}
	{#if linked}
		<a href="{base}/users/{userId}" class="inline-flex items-center gap-1.5 hover:underline">
			{#if showAvatar}
				<span
					class="inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium text-white {colors.bg}"
				>
					{initials}
				</span>
			{/if}
			<span class="font-medium {colors.text}">{user.name}</span>
		</a>
	{:else}
		<span class="inline-flex items-center gap-1.5">
			{#if showAvatar}
				<span
					class="inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium text-white {colors.bg}"
				>
					{initials}
				</span>
			{/if}
			<span class="font-medium {colors.text}">{user.name}</span>
		</span>
	{/if}
{:else}
	<span class="text-gray-400">Okänd användare</span>
{/if}
