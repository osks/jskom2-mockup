<script lang="ts">
	import { toggleSidebar } from '$lib/stores/ui';
	import { Menu } from 'lucide-svelte';
</script>

<!-- M3 Small FAB — mobile only -->
<button
	onclick={toggleSidebar}
	class="fixed left-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-xl bg-lyskom-100 text-lyskom-700 shadow-md transition-shadow hover:shadow-lg active:scale-[0.97] md:hidden"
>
	<Menu size={24} />
</button>
