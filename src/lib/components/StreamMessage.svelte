<script lang="ts">
	import type { TextInfo } from '$lib/types';
	import { getUserById, getTextById, getConferenceById } from '$lib/data';
	import { base } from '$app/paths';

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
			return { id, author: a?.name ?? `person ${t?.author ?? '?'}` };
		})
	);

	const commentChildren = $derived(
		(text.commentedIn ?? []).map((id) => {
			const t = getTextById(id);
			const a = t ? getUserById(t.author) : null;
			return { id, author: a?.name ?? `person ${t?.author ?? '?'}` };
		})
	);

	const recipientNames = $derived(
		text.recipients.map((id) => getConferenceById(id)?.name ?? `Möte ${id}`)
	);

	// Only show subject if it's a new topic (not inherited from parent)
	const showSubject = $derived(() => {
		if (commentParents.length === 0) return true;
		const parent = getTextById(text.commentTo![0]);
		if (!parent) return true;
		return text.subject !== `Re: ${parent.subject.replace(/^Re: /, '')}`;
	});
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
			<div class="flex items-baseline gap-1.5 text-sm">
				<a
					href="{base}/texts/{text.id}"
					class="font-mono text-gray-400 hover:text-gray-600"
				>#{text.id}</a>
				<span class="text-gray-300">/</span>
				<span class="text-gray-400">{isoTimeStr}</span>
				<span class="text-gray-300">/</span>
				<a
					href="{base}/users/{text.author}"
					class="font-semibold text-gray-900 hover:underline"
				>{author?.name ?? 'Okänd'}</a>
			</div>

			<!-- Comment parents -->
			{#each commentParents as parent}
				<div class="mt-0.5 text-sm text-gray-500">
					<span class="text-gray-400">↳</span>
					<a href="#text-{parent.id}" class="hover:text-gray-700">
						<span class="font-mono">#{parent.id}</span> {parent.author}
					</a>
				</div>
			{/each}

			<!-- Recipients -->
			{#each recipientNames as name}
				<div class="mt-0.5 text-sm text-gray-500">
					<span class="text-gray-400">@</span>
					{name}
				</div>
			{/each}

			<!-- Subject -->
			{#if showSubject()}
				<div class="mt-1 text-sm font-medium text-gray-900">Ärende: {text.subject}</div>
			{/if}

			<!-- Body -->
			<div class="mt-1.5 text-base leading-relaxed text-gray-800 whitespace-pre-wrap break-words overflow-hidden md:text-sm">{text.body}</div>

			<!-- Comment children -->
			{#if commentChildren.length > 0}
				<div class="mt-2 space-y-0.5">
					{#each commentChildren as child}
						<div class="text-sm text-gray-500">
							<span class="text-gray-400">↳</span>
							<a href="#text-{child.id}" class="hover:text-gray-700">
								<span class="font-mono">#{child.id}</span> {child.author}
							</a>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</article>
{/if}
