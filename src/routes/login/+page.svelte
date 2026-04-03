<script lang="ts">
	import { login } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { initReading } from '$lib/stores/reading';

	let server = $state('kom.lysator.liu.se');
	let username = $state('johan');
	let password = $state('');

	function handleLogin() {
		login(8); // Johan Strand
		initReading(8);
		goto(`${base}/read`);
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4">
	<div class="w-full max-w-sm">
		<div class="mb-8 text-center">
			<h1 class="text-3xl font-bold text-lyskom-700">jskom2</h1>
			<p class="mt-1 text-sm text-gray-500">En modern webbklient för LysKOM</p>
		</div>

		<form
			onsubmit={(e) => { e.preventDefault(); handleLogin(); }}
			class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm space-y-4"
		>
			<div>
				<label for="server" class="block text-sm font-medium text-gray-700">Server</label>
				<input
					id="server"
					type="text"
					bind:value={server}
					class="mt-1 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-mono focus:border-lyskom-500 focus:outline-none focus:ring-1 focus:ring-lyskom-500"
				/>
			</div>

			<div>
				<label for="username" class="block text-sm font-medium text-gray-700">Namn</label>
				<input
					id="username"
					type="text"
					bind:value={username}
					class="mt-1 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-lyskom-500 focus:outline-none focus:ring-1 focus:ring-lyskom-500"
				/>
			</div>

			<div>
				<label for="password" class="block text-sm font-medium text-gray-700">Lösenord</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					class="mt-1 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-lyskom-500 focus:outline-none focus:ring-1 focus:ring-lyskom-500"
				/>
			</div>

			<button
				type="submit"
				class="w-full rounded-md bg-lyskom-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-lyskom-700 transition-colors"
			>
				Logga in
			</button>
		</form>
	</div>
</div>
