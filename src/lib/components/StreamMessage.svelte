<script lang="ts">
	import type { TextInfo } from '$lib/types';
	import { getUserById, getTextById } from '$lib/data';
	import { base } from '$app/paths';

	interface Props {
		text: TextInfo;
		compact?: boolean;
		active?: boolean;
	}

	let { text, compact = false, active = false }: Props = $props();

	const author = $derived(getUserById(text.author));
	const timeStr = $derived(
		new Date(text.created).toLocaleDateString('sv-SE', {
			day: 'numeric',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit'
		})
	);

	const commentParent = $derived(
		text.commentTo && text.commentTo.length > 0 ? getTextById(text.commentTo[0]) : null
	);
	const parentAuthor = $derived(commentParent ? getUserById(commentParent.author) : null);
	const commentCount = $derived(text.commentedIn?.length ?? 0);
</script>

{#if compact}
	<a
		href="{base}/texts/{text.id}"
		class="group flex items-center gap-3 px-4 py-1.5 hover:bg-gray-50/80 transition-colors"
	>
		<span class="shrink-0 text-sm font-medium text-gray-900">{author?.name ?? 'Okänd'}</span>
		<span class="min-w-0 flex-1 truncate text-sm text-gray-600">{text.subject}</span>
		<span class="shrink-0 text-xs text-gray-400">{timeStr}</span>
		{#if commentCount > 0}
			<span class="shrink-0 text-xs text-gray-400">{commentCount}&#8617;</span>
		{/if}
	</a>
{:else}
	<article
		id="text-{text.id}"
		data-text-id={text.id}
		class="px-4 py-3 ml-1.5 border-l-2 border-b border-b-gray-100 transition-all duration-300"
		class:border-gray-400={active}
		class:border-transparent={!active}
		class:opacity-60={!active}
	>
		<div class="min-w-0">
			{#if commentParent}
				<a
					href="#text-{commentParent.id}"
					class="mb-1 inline-block text-xs text-gray-400 hover:text-gray-600"
				>
					re {parentAuthor?.name ?? `text ${commentParent.id}`}
				</a>
			{/if}

			<div class="flex items-baseline gap-2">
				<a
					href="{base}/users/{text.author}"
					class="text-sm font-semibold text-gray-900 hover:underline"
				>
					{author?.name ?? 'Okänd'}
				</a>
				<span class="text-xs text-gray-400">{timeStr}</span>
				<a
					href="{base}/texts/{text.id}"
					class="font-mono text-xs text-gray-300 hover:text-gray-600"
				>
					#{text.id}
				</a>
			</div>

			{#if !commentParent || text.subject !== `Re: ${commentParent.subject.replace(/^Re: /, '')}`}
				<div class="mt-0.5 text-sm font-medium text-gray-900">{text.subject}</div>
			{/if}

			<div class="mt-1 text-base leading-relaxed text-gray-700 whitespace-pre-wrap break-words overflow-hidden md:text-sm">{text.body}</div>

			{#if commentCount > 0}
				<div class="mt-1.5 text-xs text-gray-400">
					{commentCount} {commentCount === 1 ? 'kommentar' : 'kommentarer'}
				</div>
			{/if}
		</div>
	</article>
{/if}
