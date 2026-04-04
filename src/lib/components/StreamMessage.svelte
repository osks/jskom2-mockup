<script lang="ts">
	import type { TextInfo } from '$lib/types';
	import { getUserById, getTextById, getAuthorColor } from '$lib/data';
	import { setCommentTo } from '$lib/stores/reading';
	import { base } from '$app/paths';
	import { MessageSquare } from 'lucide-svelte';

	interface Props {
		text: TextInfo;
		compact?: boolean;
	}

	let { text, compact = false }: Props = $props();

	const author = $derived(getUserById(text.author));
	const colors = $derived(getAuthorColor(text.author));
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

	function handleComment() {
		setCommentTo(text.id);
	}
</script>

{#if compact}
	<a
		href="{base}/texts/{text.id}"
		class="group flex items-center gap-3 px-4 py-1.5 hover:bg-gray-50/80 transition-colors"
	>
		<div class="shrink-0 w-0.5 self-stretch rounded-full {colors.border}"></div>
		<span class="shrink-0 text-sm font-medium {colors.text}">{author?.name ?? 'Okänd'}</span>
		<span class="min-w-0 flex-1 truncate text-sm text-gray-700">{text.subject}</span>
		<span class="shrink-0 text-xs text-gray-400">{timeStr}</span>
		{#if commentCount > 0}
			<span class="shrink-0 text-xs text-gray-400">{commentCount}&#8617;</span>
		{/if}
	</a>
{:else}
	<article
		id="text-{text.id}"
		class="group flex gap-3 px-4 py-2.5 hover:bg-gray-50/80 transition-colors"
	>
		<div class="shrink-0 w-0.5 rounded-full {colors.border} self-stretch"></div>

		<div class="min-w-0 flex-1">
			{#if commentParent}
				<a
					href="#text-{commentParent.id}"
					class="mb-1 inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
				>
					<span class="text-gray-300">&larrhk;</span>
					{#if parentAuthor}
						{parentAuthor.name}
					{:else}
						text {commentParent.id}
					{/if}
				</a>
			{/if}

			<div class="flex items-baseline gap-2">
				<a
					href="{base}/users/{text.author}"
					class="text-sm font-semibold {colors.text} hover:underline"
				>
					{author?.name ?? 'Okänd'}
				</a>
				<span class="text-xs text-gray-400">{timeStr}</span>
				<a
					href="{base}/texts/{text.id}"
					class="font-mono text-xs text-gray-300 hover:text-lyskom-600"
				>
					#{text.id}
				</a>
			</div>

			{#if !commentParent || text.subject !== `Re: ${commentParent.subject.replace(/^Re: /, '')}`}
				<div class="mt-0.5 text-sm font-medium text-gray-900">{text.subject}</div>
			{/if}

			<div class="mt-1 text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">{text.body}</div>

			<div class="mt-1 flex items-center gap-3">
				<button
					onclick={handleComment}
					class="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-gray-400 hover:bg-gray-100 hover:text-gray-600 md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100"
				>
					<MessageSquare size={12} />
					Kommentera
				</button>

				{#if commentCount > 0}
					<span class="text-xs text-gray-400">
						{commentCount} {commentCount === 1 ? 'kommentar' : 'kommentarer'}
					</span>
				{/if}
			</div>
		</div>
	</article>
{/if}
