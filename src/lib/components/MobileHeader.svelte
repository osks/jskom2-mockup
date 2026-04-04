<script lang="ts">
	import { toggleSidebar } from '$lib/stores/ui';
	import { Menu } from 'lucide-svelte';
</script>

<button
	onclick={toggleSidebar}
	class="fixed left-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm text-gray-500 shadow-sm transition-shadow hover:shadow-md active:scale-[0.97] md:hidden"
>
	<Menu size={20} />
</button>
