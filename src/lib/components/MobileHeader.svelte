<script lang="ts">
	import { toggleSidebar } from '$lib/stores/ui';
	import { Menu } from 'lucide-svelte';
</script>

<!-- Floating hamburger button — mobile only -->
<button
	onclick={toggleSidebar}
	class="fixed left-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/60 text-gray-500 shadow-sm backdrop-blur-sm active:scale-95 md:hidden"
>
	<Menu size={16} />
</button>
