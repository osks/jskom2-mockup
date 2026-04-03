<script lang="ts">
	import type { TextInfo } from '$lib/types';
	import { getUserById, getTextById } from '$lib/data';
	import { setCommentTo } from '$lib/stores/reading';
	import { base } from '$app/paths';
	import { MessageSquare } from 'lucide-svelte';

	interface Props {
		text: TextInfo;
	}

	let { text }: Props = $props();

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

	// Stable author color based on user id
	const authorColors = [
		'border-blue-400',
		'border-emerald-400',
		'border-amber-400',
		'border-rose-400',
		'border-purple-400',
		'border-cyan-400',
		'border-orange-400',
		'border-indigo-400'
	];
	const authorNameColors = [
		'text-blue-700',
		'text-emerald-700',
		'text-amber-700',
		'text-rose-700',
		'text-purple-700',
		'text-cyan-700',
		'text-orange-700',
		'text-indigo-700'
	];
	const colorIdx = $derived(text.author % authorColors.length);

	function handleComment() {
		setCommentTo(text.id);
	}
</script>

<article
	id="text-{text.id}"
	class="group flex gap-3 px-4 py-2.5 hover:bg-gray-50/80 transition-colors"
>
	<!-- Author color bar -->
	<div class="shrink-0 w-0.5 rounded-full {authorColors[colorIdx]} self-stretch"></div>

	<div class="min-w-0 flex-1">
		<!-- Reply reference -->
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

		<!-- Author line -->
		<div class="flex items-baseline gap-2">
			<a
				href="{base}/users/{text.author}"
				class="text-sm font-semibold {authorNameColors[colorIdx]} hover:underline"
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

		<!-- Subject (only when it's new or changed) -->
		{#if !commentParent || text.subject !== `Re: ${commentParent.subject.replace(/^Re: /, '')}`}
			<div class="mt-0.5 text-sm font-medium text-gray-900">{text.subject}</div>
		{/if}

		<!-- Body -->
		<div class="mt-1 text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">{text.body}</div>

		<!-- Actions -->
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
