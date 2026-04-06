<script lang="ts">
	import type { TextInfo } from '$lib/types';
	import { getUserById, getTextById, getConferenceById } from '$lib/data';
	import { återseText } from '$lib/stores/reading';
	import { base } from '$app/paths';
	import InfoPopover from './InfoPopover.svelte';

	interface Props {
		text: TextInfo;
		compact?: boolean;
		active?: boolean;
	}

	let { text, compact = false, active = false }: Props = $props();

	const author = $derived(getUserById(text.author));
	const isoTimeStr = $derived(
		new Date(text.created).toLocaleString('sv-SE', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		})
	);
	const shortTimeStr = $derived(
		new Date(text.created).toLocaleDateString('sv-SE', {
			day: 'numeric',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit'
		})
	);

	const commentParents = $derived(
		(text.commentTo ?? []).map((id) => {
			const t = getTextById(id);
			const a = t ? getUserById(t.author) : null;
			return { id, text: t, author: a, authorName: a?.name ?? `person ${t?.author ?? '?'}` };
		})
	);

	const commentChildren = $derived(
		(text.commentedIn ?? []).map((id) => {
			const t = getTextById(id);
			const a = t ? getUserById(t.author) : null;
			return { id, text: t, author: a, authorName: a?.name ?? `person ${t?.author ?? '?'}` };
		})
	);

	const recipientConfs = $derived(
		text.recipients.map((id) => ({ id, conf: getConferenceById(id) }))
	);

	const ccRecipientConfs = $derived(
		(text.ccRecipients ?? []).map((id) => ({ id, conf: getConferenceById(id) }))
	);

	const remarkAuthors = $derived(
		(text.remarks ?? []).map((r) => ({
			...r,
			authorName: getUserById(r.author)?.name ?? 'Okänd'
		}))
	);


</script>

{#if compact}
	<a
		href="{base}/texts/{text.id}"
		class="group flex items-center gap-3 px-4 py-1.5 hover:bg-gray-50/80 transition-colors"
	>
		<span class="shrink-0 text-sm font-medium text-gray-900">{author?.name ?? 'Okänd'}</span>
		<span class="min-w-0 flex-1 truncate text-sm text-gray-600">{text.subject}</span>
		<span class="shrink-0 text-xs text-gray-400">{shortTimeStr}</span>
		{#if commentChildren.length > 0}
			<span class="shrink-0 text-xs text-gray-400">{commentChildren.length}↳</span>
		{/if}
	</a>
{:else}
	<article
		id="text-{text.id}"
		data-text-id={text.id}
		class="px-4 py-3 ml-1.5 border-l-2 transition-all duration-300"
		class:border-gray-400={active}
		class:border-transparent={!active}
	>
		<div class="min-w-0">
			<!-- First line: #textno / datetime / author -->
			<div class="flex items-baseline gap-1.5 text-sm flex-wrap">
				<InfoPopover>
					{#snippet children()}
						<span class="font-mono text-gray-400">#{text.id}</span>
					{/snippet}
					{#snippet popup()}
						<div class="text-sm">
							<div class="font-semibold text-gray-900 mb-1">Text #{text.id}</div>
							<button
								onclick={() => återseText(text.id)}
								class="block w-full text-left px-1 py-1 text-lyskom-600 hover:underline"
							>Återse</button>
						</div>
					{/snippet}
				</InfoPopover>
				<span class="text-gray-300">/</span>
				<span class="text-gray-400">{isoTimeStr}</span>
				<span class="text-gray-300">/</span>
				<InfoPopover>
					{#snippet children()}
						<span class="font-semibold text-gray-900">{author?.name ?? 'Okänd'}</span>
					{/snippet}
					{#snippet popup()}
						<div class="space-y-1 text-sm">
							<div class="font-semibold text-gray-900">{author?.name ?? 'Okänd'}</div>
							<div class="text-gray-500">Person <span class="font-mono">#{text.author}</span></div>
							{#if author}
								<div class="text-gray-500">{author.totalTexts} texter</div>
								<a href="{base}/users/{text.author}" class="block text-lyskom-600 hover:underline">Visa profil</a>
							{/if}
						</div>
					{/snippet}
				</InfoPopover>
			</div>

			<!-- Comment parents -->
			{#each commentParents as parent}
				<div class="mt-0.5 text-sm text-gray-500">
					<span class="text-gray-400">↳</span>
					<InfoPopover>
						{#snippet children()}
							<span class="font-mono cursor-pointer hover:text-gray-700">#{parent.id}</span>
						{/snippet}
						{#snippet popup()}
							<div class="text-sm">
								<div class="font-semibold text-gray-900 mb-1">Text #{parent.id}</div>
								<button
									onclick={() => återseText(parent.id)}
									class="block w-full text-left px-1 py-1 text-lyskom-600 hover:underline"
								>Återse</button>
							</div>
						{/snippet}
					</InfoPopover>
					by
					<InfoPopover>
						{#snippet children()}
							<span>{parent.authorName}</span>
						{/snippet}
						{#snippet popup()}
							<div class="space-y-1 text-sm">
								<div class="font-semibold text-gray-900">{parent.authorName}</div>
								{#if parent.author}
									<div class="text-gray-500">Person <span class="font-mono">#{parent.author.id}</span></div>
									<div class="text-gray-500">{parent.author.totalTexts} texter</div>
									<a href="{base}/users/{parent.author.id}" class="block text-lyskom-600 hover:underline">Visa profil</a>
								{/if}
							</div>
						{/snippet}
					</InfoPopover>
				</div>
			{/each}

			<!-- Recipients -->
			{#each recipientConfs as { id, conf }}
				<div class="mt-0.5 text-sm text-gray-500">
					<span class="text-gray-400">@</span>
					<InfoPopover>
						{#snippet children()}
							<span>{conf?.name ?? `Möte ${id}`}</span>
						{/snippet}
						{#snippet popup()}
							<div class="space-y-1 text-sm">
								<div class="font-semibold text-gray-900">{conf?.name ?? `Möte ${id}`}</div>
								<div class="text-gray-500">Möte <span class="font-mono">#{id}</span></div>
								{#if conf}
									<div class="text-gray-500">{conf.members} medlemmar · {conf.totalTexts} texter</div>
									<a href="{base}/conferences/{id}" class="block text-lyskom-600 hover:underline">Visa möte</a>
								{/if}
							</div>
						{/snippet}
					</InfoPopover>
				</div>
			{/each}

			<!-- CC Recipients -->
			{#each ccRecipientConfs as { id, conf }}
				<div class="mt-0.5 text-sm text-gray-500">
					<span class="text-gray-400">cc</span>
					<InfoPopover>
						{#snippet children()}
							<span>{conf?.name ?? `Möte ${id}`}</span>
						{/snippet}
						{#snippet popup()}
							<div class="space-y-1 text-sm">
								<div class="font-semibold text-gray-900">{conf?.name ?? `Möte ${id}`}</div>
								<div class="text-gray-500">Möte <span class="font-mono">#{id}</span></div>
								{#if conf}
									<div class="text-gray-500">{conf.members} medlemmar · {conf.totalTexts} texter</div>
									<a href="{base}/conferences/{id}" class="block text-lyskom-600 hover:underline">Visa möte</a>
								{/if}
							</div>
						{/snippet}
					</InfoPopover>
				</div>
			{/each}

			<!-- Subject -->
			<div class="mt-1 text-sm font-medium text-gray-900">Ärende: {text.subject}</div>

			<!-- Body -->
			<div class="mt-1.5 text-base leading-relaxed text-gray-800 whitespace-pre-wrap break-words overflow-hidden md:text-sm">{text.body}</div>

			<!-- Anmärkningar (remarks) -->
			{#if remarkAuthors.length > 0}
				<div class="mt-2 pl-4 space-y-0.5">
					{#each remarkAuthors as remark}
						<div class="text-sm text-gray-500">
							<span class="text-gray-400">—</span>
							{remark.authorName}: <span class="text-gray-600">{remark.body}</span>
						</div>
					{/each}
				</div>
			{/if}

			<!-- Comment children -->
			{#if commentChildren.length > 0}
				<div class="mt-2 pl-4 space-y-0.5">
					{#each commentChildren as child}
						<div class="text-sm text-gray-500">
							<span class="text-gray-400">↳</span>
							<InfoPopover>
								{#snippet children()}
									<span class="font-mono cursor-pointer hover:text-gray-700">#{child.id}</span>
								{/snippet}
								{#snippet popup()}
									<div class="text-sm">
										<div class="font-semibold text-gray-900 mb-1">Text #{child.id}</div>
										<button
											onclick={() => återseText(child.id)}
											class="block w-full text-left px-1 py-1 text-lyskom-600 hover:underline"
										>Återse</button>
									</div>
								{/snippet}
							</InfoPopover>
							by
							<InfoPopover>
								{#snippet children()}
									<span>{child.authorName}</span>
								{/snippet}
								{#snippet popup()}
									<div class="space-y-1 text-sm">
										<div class="font-semibold text-gray-900">{child.authorName}</div>
										{#if child.author}
											<div class="text-gray-500">Person <span class="font-mono">#{child.author.id}</span></div>
											<div class="text-gray-500">{child.author.totalTexts} texter</div>
											<a href="{base}/users/{child.author.id}" class="block text-lyskom-600 hover:underline">Visa profil</a>
										{/if}
									</div>
								{/snippet}
							</InfoPopover>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</article>
{/if}
