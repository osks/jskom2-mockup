<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		popup: Snippet;
	}

	let { children, popup }: Props = $props();
	let open = $state(false);

	function toggle(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		open = !open;
	}

	function close() {
		open = false;
	}
</script>

<span class="relative inline">
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<span onclick={toggle} class="cursor-pointer">
		{@render children()}
	</span>

	{#if open}
		<!-- Backdrop -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="fixed inset-0 z-40" onclick={close}></div>

		<!-- Popover -->
		<div class="absolute left-0 top-full z-50 mt-1 min-w-48 rounded-xl bg-surface-1 py-2 px-3 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-surface-4">
			{@render popup()}
		</div>
	{/if}
</span>
