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

<div class="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-100 via-gray-50 to-gray-200 px-4">
	<div class="w-full max-w-sm">
		<div class="mb-8 text-center">
			<h1 class="text-3xl font-bold text-lyskom-700">jskom2</h1>
			<p class="mt-1 text-sm text-gray-500">En modern webbklient för LysKOM</p>
		</div>

		<form
			onsubmit={(e) => { e.preventDefault(); handleLogin(); }}
			class="rounded-2xl bg-white/70 backdrop-blur-md p-6 shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.9),inset_0_0_0_0.5px_rgba(255,255,255,0.5)] space-y-4"
		>
			<div>
				<label for="server" class="block text-sm font-medium text-gray-700">Server</label>
				<input
					id="server"
					type="text"
					bind:value={server}
					class="mt-1 w-full rounded-xl bg-white/60 backdrop-blur-sm px-3 py-2 text-sm font-mono shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.9),inset_0_0_0_0.5px_rgba(255,255,255,0.5)] focus:bg-white/80 focus:outline-none focus:ring-1 focus:ring-lyskom-500"
				/>
			</div>

			<div>
				<label for="username" class="block text-sm font-medium text-gray-700">Namn</label>
				<input
					id="username"
					type="text"
					bind:value={username}
					class="mt-1 w-full rounded-xl bg-white/60 backdrop-blur-sm px-3 py-2 text-sm shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.9),inset_0_0_0_0.5px_rgba(255,255,255,0.5)] focus:bg-white/80 focus:outline-none focus:ring-1 focus:ring-lyskom-500"
				/>
			</div>

			<div>
				<label for="password" class="block text-sm font-medium text-gray-700">Lösenord</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					class="mt-1 w-full rounded-xl bg-white/60 backdrop-blur-sm px-3 py-2 text-sm shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.9),inset_0_0_0_0.5px_rgba(255,255,255,0.5)] focus:bg-white/80 focus:outline-none focus:ring-1 focus:ring-lyskom-500"
				/>
			</div>

			<button
				type="submit"
				class="w-full rounded-full bg-gray-900/80 backdrop-blur-md px-4 py-2.5 text-sm font-semibold text-white shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.2),inset_0_0_0_0.5px_rgba(255,255,255,0.1)] active:bg-gray-700 transition-colors"
			>
				Logga in
			</button>
		</form>
	</div>
</div>
