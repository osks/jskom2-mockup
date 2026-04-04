<script lang="ts">
	import { toggleSidebar } from '$lib/stores/ui';
	import { Menu } from 'lucide-svelte';
</script>

<!-- Floating hamburger button — mobile only -->
<button
	onclick={toggleSidebar}
	class="fixed left-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-gray-900/80 text-white shadow-lg backdrop-blur-sm active:scale-95 md:hidden"
>
	<Menu size={20} />
</button>
