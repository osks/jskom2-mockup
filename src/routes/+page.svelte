<script lang="ts">
	import { currentUser } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';

	$effect(() => {
		if ($currentUser) {
			goto(`${base}/read`);
		} else {
			goto(`${base}/login`);
		}
	});
</script>
