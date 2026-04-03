<script lang="ts">
	import { Search } from 'lucide-svelte';

	interface Props {
		value?: string;
		onSearch?: (query: string) => void;
	}

	let { value = $bindable(''), onSearch }: Props = $props();

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		value = target.value;
		onSearch?.(value);
	}
</script>

<div class="relative">
	<Search size={16} class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
	<input
		type="text"
		{value}
		oninput={handleInput}
		placeholder="Sök texter, möten, personer..."
		class="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-lyskom-500 focus:outline-none focus:ring-1 focus:ring-lyskom-500"
	/>
</div>
