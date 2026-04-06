<script lang="ts">
	import { Hash } from 'lucide-svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		popup: Snippet;
	}

	let { children, popup }: Props = $props();
	let open = $state(false);
	let triggerEl: HTMLElement | undefined = $state();

	function toggle(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		open = !open;
	}

	function close() {
		open = false;
	}
</script>

<span class="relative inline-flex items-baseline gap-0.5">
	{@render children()}
	<button
		bind:this={triggerEl}
		onclick={toggle}
		class="inline-flex items-center justify-center text-gray-300 hover:text-gray-500 transition-colors"
		aria-label="Visa info"
	>
		<Hash size={12} />
	</button>

	{#if open}
		<!-- Backdrop -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="fixed inset-0 z-40" onclick={close}></div>

		<!-- Popover -->
		<div class="absolute left-0 top-full z-50 mt-1 min-w-48 rounded-xl bg-white py-2 px-3 shadow-lg ring-1 ring-gray-200/60">
			{@render popup()}
		</div>
	{/if}
</span>
