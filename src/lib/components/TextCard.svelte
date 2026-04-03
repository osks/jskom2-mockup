<script lang="ts">
	import type { TextInfo } from '$lib/types';
	import { getUserById, getConferenceById, getTextById } from '$lib/data';
	import UserBadge from './UserBadge.svelte';
	import { MessageSquare, Bookmark } from 'lucide-svelte';

	interface Props {
		text: TextInfo;
		compact?: boolean;
	}

	let { text, compact = false }: Props = $props();

	const author = $derived(getUserById(text.author));
	const dateStr = $derived(
		new Date(text.created).toLocaleDateString('sv-SE', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		})
	);
	const timeStr = $derived(
		new Date(text.created).toLocaleTimeString('sv-SE', {
			hour: '2-digit',
			minute: '2-digit'
		})
	);
</script>

{#if compact}
	<a
		href="/texts/{text.id}"
		class="flex items-baseline gap-3 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors"
	>
		<span class="font-mono text-xs text-gray-400 shrink-0">#{text.id}</span>
		<span class="font-medium text-gray-900 truncate">{text.subject}</span>
		<span class="text-sm text-gray-500 shrink-0">
			{author?.name ?? 'Okänd'}
		</span>
		<span class="text-xs text-gray-400 shrink-0">{dateStr}</span>
		{#if text.commentedIn && text.commentedIn.length > 0}
			<span class="text-xs text-gray-400 shrink-0 flex items-center gap-0.5">
				<MessageSquare size={12} />
				{text.commentedIn.length}
			</span>
		{/if}
	</a>
{:else}
	<article class="rounded-lg border border-gray-200 bg-white shadow-sm">
		<!-- Header -->
		<div class="border-b border-gray-100 px-5 py-3">
			<div class="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm text-gray-500">
				<span class="font-mono font-medium text-lyskom-600">#{text.id}</span>
				<span>{dateStr} {timeStr}</span>
				<span>{text.lines} {text.lines === 1 ? 'rad' : 'rader'}</span>
			</div>
			<div class="mt-1">
				<UserBadge userId={text.author} />
			</div>

			<!-- Comment references -->
			{#if text.commentTo && text.commentTo.length > 0}
				<div class="mt-1.5 space-y-0.5">
					{#each text.commentTo as parentId}
						{@const parent = getTextById(parentId)}
						<div class="text-sm text-gray-500">
							Kommentar till
							<a href="/texts/{parentId}" class="font-mono text-lyskom-600 hover:underline"
								>text {parentId}</a
							>
							{#if parent}
								av <UserBadge userId={parent.author} showAvatar={false} />
							{/if}
						</div>
					{/each}
				</div>
			{/if}

			<!-- Recipients -->
			<div class="mt-1.5 space-y-0.5">
				{#each text.recipients as confId}
					{@const conf = getConferenceById(confId)}
					<div class="text-sm text-gray-500">
						Mottagare:
						<a href="/conferences/{confId}" class="text-lyskom-600 hover:underline">
							{conf?.name ?? `Möte ${confId}`}
						</a>
					</div>
				{/each}
			</div>

			<!-- Subject -->
			<div class="mt-2 text-lg font-semibold text-gray-900">{text.subject}</div>
		</div>

		<!-- Body -->
		<div class="px-5 py-4">
			<pre class="font-mono text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">{text.body}</pre>
		</div>

		<!-- Footer -->
		<div class="border-t border-gray-100 px-5 py-3">
			<!-- Comments to this text -->
			{#if text.commentedIn && text.commentedIn.length > 0}
				<div class="mb-3 space-y-0.5">
					{#each text.commentedIn as childId}
						{@const child = getTextById(childId)}
						<div class="text-sm text-gray-500">
							Kommentar i
							<a href="/texts/{childId}" class="font-mono text-lyskom-600 hover:underline"
								>text {childId}</a
							>
							{#if child}
								av <UserBadge userId={child.author} showAvatar={false} />
							{/if}
						</div>
					{/each}
				</div>
			{/if}

			<!-- Actions -->
			<div class="flex gap-2">
				<a
					href="/compose?commentTo={text.id}"
					class="inline-flex items-center gap-1.5 rounded-md bg-lyskom-50 px-3 py-1.5 text-sm font-medium text-lyskom-700 hover:bg-lyskom-100 transition-colors"
				>
					<MessageSquare size={14} />
					Kommentera
				</a>
				<button
					class="inline-flex items-center gap-1.5 rounded-md bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
				>
					<Bookmark size={14} />
					Markera
				</button>
			</div>
		</div>
	</article>
{/if}
