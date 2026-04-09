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
	<span role="button" tabindex="0" onclick={toggle} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(e as any); } }} class="cursor-pointer">
		{@render children()}
	</span>

	{#if open}
		<!-- Backdrop -->
		<div role="button" tabindex="-1" class="fixed inset-0 z-40" onclick={close} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') close(); }}></div>

		<!-- Popover -->
		<div class="absolute left-0 top-full z-50 mt-1 min-w-48 rounded-xl bg-white py-2 px-3 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border-[0.5px] border-surface-5">
			{@render popup()}
		</div>
	{/if}
</span>
