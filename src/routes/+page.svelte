<script lang="ts">
	import { currentUser } from '$lib/stores/auth';
	import { goto } from '$app/navigation';

	$effect(() => {
		if ($currentUser) {
			goto('/read');
		} else {
			goto('/login');
		}
	});
</script>
