<script lang="ts">
	import type { TextInfo } from '$lib/types';
	import { getUserById, getTextById, getConferenceById } from '$lib/data';
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

	const initials = $derived(
		author
			? author.name
					.split(' ')
					.map((n: string) => n[0])
					.join('')
			: '?'
	);
	const avatarColors = [
		'bg-blue-500',
		'bg-emerald-500',
		'bg-amber-500',
		'bg-rose-500',
		'bg-purple-500',
		'bg-cyan-500',
		'bg-orange-500',
		'bg-indigo-500'
	];
	const avatarColor = $derived(avatarColors[text.author % avatarColors.length]);

	function handleComment() {
		setCommentTo(text.id);
	}
</script>

<article
	id="text-{text.id}"
	class="group relative px-4 py-3 hover:bg-gray-50/50 transition-colors"
>
	<!-- Reply reference -->
	{#if commentParent}
		<a
			href="#text-{commentParent.id}"
			class="mb-1.5 flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
		>
			<svg class="h-3 w-3 shrink-0" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
				<path d="M8 2L4 6l4 4" />
			</svg>
			<span>
				Kommentar till text {commentParent.id}
				{#if parentAuthor}
					av {parentAuthor.name}
				{/if}
			</span>
		</a>
	{/if}

	<div class="flex gap-3">
		<!-- Avatar -->
		<div class="shrink-0 pt-0.5">
			<a
				href="{base}/users/{text.author}"
				class="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white {avatarColor} hover:opacity-80 transition-opacity"
			>
				{initials}
			</a>
		</div>

		<!-- Content -->
		<div class="min-w-0 flex-1">
			<!-- Author line -->
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
					class="font-mono text-xs text-gray-300 hover:text-lyskom-600 transition-colors"
				>
					#{text.id}
				</a>
			</div>

			<!-- Subject -->
			{#if !commentParent || text.subject !== `Re: ${commentParent.subject.replace(/^Re: /, '')}`}
				<div class="mt-0.5 text-sm font-semibold text-gray-800">{text.subject}</div>
			{/if}

			<!-- Body -->
			<div class="mt-1">
				<pre class="font-mono text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">{text.body}</pre>
			</div>

			<!-- Actions -->
			<div class="mt-1.5 flex items-center gap-3">
				<button
					onclick={handleComment}
					class="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
				>
					<MessageSquare size={12} />
					Kommentera
				</button>

				{#if commentCount > 0}
					<span class="flex items-center gap-1 text-xs text-lyskom-600">
						<MessageSquare size={12} />
						{commentCount} {commentCount === 1 ? 'kommentar' : 'kommentarer'}
					</span>
				{/if}
			</div>
		</div>
	</div>
</article>
