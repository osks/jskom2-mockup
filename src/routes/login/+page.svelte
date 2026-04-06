<script lang="ts">
	import { login, connections } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { initReading } from '$lib/stores/reading';

	const servers = [
		{ name: 'kom.lysator.liu.se', label: 'Lysator' },
		{ name: 'kom.stacken.kth.se', label: 'Stacken' },
		{ name: 'kom.ludd.ltu.se', label: 'Ludd' }
	];

	let server = $state(servers[0].name);
	let username = $state('johan');
	let password = $state('');

	const hasConnections = $derived($connections.length > 0);

	function handleLogin() {
		login(8, server); // Johan Strand
		initReading(8);
		goto(`${base}/read`);
	}

	function handleBack() {
		goto(`${base}/read`);
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-200 via-gray-300 to-gray-200 px-4">
	<div class="w-full max-w-sm">
		<div class="mb-8 text-center">
			<h1 class="text-3xl font-bold text-lyskom-700">jskom2</h1>
			<p class="mt-1 text-sm text-gray-500">
				{#if hasConnections}
					Anslut till en till server
				{:else}
					En modern webbklient för LysKOM
				{/if}
			</p>
		</div>

		<form
			onsubmit={(e) => { e.preventDefault(); handleLogin(); }}
			class="rounded-2xl bg-gray-200/40 backdrop-blur-md ring-1 ring-white/80 p-6 space-y-4"
		>
			<div>
				<label for="server" class="block text-sm font-medium text-gray-700">Server</label>
				<select
					id="server"
					bind:value={server}
					class="mt-1 w-full rounded-full bg-white/60 px-4 py-2 text-sm font-mono ring-1 ring-white/80 focus:bg-white/80 focus:outline-none focus:ring-1 focus:ring-lyskom-500 appearance-none"
				>
					{#each servers as s}
						<option value={s.name}>{s.name}</option>
					{/each}
				</select>
			</div>

			<div>
				<label for="username" class="block text-sm font-medium text-gray-700">Namn</label>
				<input
					id="username"
					type="text"
					bind:value={username}
					class="mt-1 w-full rounded-full bg-white/60 px-4 py-2 text-sm ring-1 ring-white/80 focus:bg-white/80 focus:outline-none focus:ring-1 focus:ring-lyskom-500"
				/>
			</div>

			<div>
				<label for="password" class="block text-sm font-medium text-gray-700">Lösenord</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					class="mt-1 w-full rounded-full bg-white/60 px-4 py-2 text-sm ring-1 ring-white/80 focus:bg-white/80 focus:outline-none focus:ring-1 focus:ring-lyskom-500"
				/>
			</div>

			<button
				type="submit"
				class="w-full rounded-full bg-gray-900/80 ring-1 ring-white/25 px-4 py-2.5 text-sm font-semibold text-white active:bg-gray-700 transition-colors"
			>
				Logga in
			</button>

			{#if hasConnections}
				<button
					type="button"
					onclick={handleBack}
					class="w-full rounded-full px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
				>
					Tillbaka
				</button>
			{/if}
		</form>
	</div>
</div>
