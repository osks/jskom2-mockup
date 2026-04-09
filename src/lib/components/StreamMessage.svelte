<script lang="ts">
	import type { TextInfo } from '$lib/types';
	import { getUserById, getTextById, getConferenceById } from '$lib/data';
	import { reviewText } from '$lib/stores/reading';
	import { base } from '$app/paths';
	import InfoPopover from './InfoPopover.svelte';

	interface Props {
		text: TextInfo;
		compact?: boolean;
		active?: boolean;
		commentTarget?: boolean;
	}

	let { text, compact = false, active = false, commentTarget = false }: Props = $props();

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
		class="group flex items-center gap-3 px-4 py-1.5 hover:bg-surface-1/80 transition-colors"
	>
		<span class="shrink-0 text-sm font-medium text-txt">{author?.name ?? 'Okänd'}</span>
		<span class="min-w-0 flex-1 truncate text-sm text-txt-secondary">{text.subject}</span>
		<span class="shrink-0 text-xs text-txt-muted">{shortTimeStr}</span>
		{#if commentChildren.length > 0}
			<span class="shrink-0 text-xs text-txt-muted">{commentChildren.length}↳</span>
		{/if}
	</a>
{:else}
	<article
		id="text-{text.id}"
		data-text-id={text.id}
		class="px-4 py-3 ml-1.5 mr-1.5 border-l-2 border-r-2 border-r-transparent transition-all duration-300 {commentTarget ? 'border-l-primary' : active ? 'border-l-txt-muted' : 'border-l-transparent'}"
	>
		<div class="min-w-0">
			<!-- First line: #textno / datetime / author -->
			<div class="flex items-baseline gap-1.5 text-sm flex-wrap">
				<InfoPopover>
					{#snippet children()}
						<span class="font-mono text-txt-muted">#{text.id}</span>
					{/snippet}
					{#snippet popup()}
						<div class="text-sm">
							<div class="font-semibold text-txt mb-1">Text #{text.id}</div>
							<button
								onclick={() => reviewText(text.id)}
								class="block w-full text-left px-1 py-1 text-primary hover:underline"
							>Återse</button>
						</div>
					{/snippet}
				</InfoPopover>
				<span class="text-txt-muted">/</span>
				<span class="text-txt-muted">{isoTimeStr}</span>
				<span class="text-txt-muted">/</span>
				<InfoPopover>
					{#snippet children()}
						<span class="font-semibold text-txt">{author?.name ?? 'Okänd'}</span>
					{/snippet}
					{#snippet popup()}
						<div class="space-y-1 text-sm">
							<div class="font-semibold text-txt">{author?.name ?? 'Okänd'}</div>
							<div class="text-txt-secondary">Person <span class="font-mono">#{text.author}</span></div>
							{#if author}
								<div class="text-txt-secondary">{author.totalTexts} texter</div>
								<a href="{base}/users/{text.author}" class="block text-primary hover:underline">Visa profil</a>
							{/if}
						</div>
					{/snippet}
				</InfoPopover>
			</div>

			<!-- Comment parents -->
			{#each commentParents as parent}
				<div class="mt-0.5 text-sm text-txt-secondary">
					<span class="text-txt-muted">↳</span>
					<InfoPopover>
						{#snippet children()}
							<span class="font-mono cursor-pointer hover:text-txt-secondary">#{parent.id}</span>
						{/snippet}
						{#snippet popup()}
							<div class="text-sm">
								<div class="font-semibold text-txt mb-1">Text #{parent.id}</div>
								<button
									onclick={() => reviewText(parent.id)}
									class="block w-full text-left px-1 py-1 text-primary hover:underline"
								>Återse</button>
							</div>
						{/snippet}
					</InfoPopover>
					av
					<InfoPopover>
						{#snippet children()}
							<span>{parent.authorName}</span>
						{/snippet}
						{#snippet popup()}
							<div class="space-y-1 text-sm">
								<div class="font-semibold text-txt">{parent.authorName}</div>
								{#if parent.author}
									<div class="text-txt-secondary">Person <span class="font-mono">#{parent.author.id}</span></div>
									<div class="text-txt-secondary">{parent.author.totalTexts} texter</div>
									<a href="{base}/users/{parent.author.id}" class="block text-primary hover:underline">Visa profil</a>
								{/if}
							</div>
						{/snippet}
					</InfoPopover>
				</div>
			{/each}

			<!-- Recipients -->
			{#each recipientConfs as { id, conf }}
				<div class="mt-0.5 text-sm text-txt-secondary">
					<span class="text-txt-muted">@</span>
					<InfoPopover>
						{#snippet children()}
							<span>{conf?.name ?? `Möte ${id}`}</span>
						{/snippet}
						{#snippet popup()}
							<div class="space-y-1 text-sm">
								<div class="font-semibold text-txt">{conf?.name ?? `Möte ${id}`}</div>
								<div class="text-txt-secondary">Möte <span class="font-mono">#{id}</span></div>
								{#if conf}
									<div class="text-txt-secondary">{conf.members} medlemmar · {conf.totalTexts} texter</div>
									<a href="{base}/conferences/{id}" class="block text-primary hover:underline">Visa möte</a>
								{/if}
							</div>
						{/snippet}
					</InfoPopover>
				</div>
			{/each}

			<!-- CC Recipients -->
			{#each ccRecipientConfs as { id, conf }}
				<div class="mt-0.5 text-sm text-txt-secondary">
					<span class="text-txt-muted">cc</span>
					<InfoPopover>
						{#snippet children()}
							<span>{conf?.name ?? `Möte ${id}`}</span>
						{/snippet}
						{#snippet popup()}
							<div class="space-y-1 text-sm">
								<div class="font-semibold text-txt">{conf?.name ?? `Möte ${id}`}</div>
								<div class="text-txt-secondary">Möte <span class="font-mono">#{id}</span></div>
								{#if conf}
									<div class="text-txt-secondary">{conf.members} medlemmar · {conf.totalTexts} texter</div>
									<a href="{base}/conferences/{id}" class="block text-primary hover:underline">Visa möte</a>
								{/if}
							</div>
						{/snippet}
					</InfoPopover>
				</div>
			{/each}

			<!-- Subject -->
			<div class="mt-1 text-sm font-medium text-txt">Ärende: {text.subject}</div>

			<!-- Body -->
			<div class="mt-1.5 text-base leading-relaxed text-txt whitespace-pre-wrap break-words overflow-hidden md:text-sm">{text.body}</div>

			<!-- Anmärkningar (remarks) -->
			{#if remarkAuthors.length > 0}
				<div class="mt-2 pl-4 space-y-0.5">
					{#each remarkAuthors as remark}
						<div class="text-sm text-txt-secondary">
							<span class="text-txt-muted">—</span>
							{remark.authorName}: <span class="text-txt-secondary">{remark.body}</span>
						</div>
					{/each}
				</div>
			{/if}

			<!-- Comment children -->
			{#if commentChildren.length > 0}
				<div class="mt-2 pl-4 space-y-0.5">
					{#each commentChildren as child}
						<div class="text-sm text-txt-secondary">
							<span class="text-txt-muted">↳</span>
							<InfoPopover>
								{#snippet children()}
									<span class="font-mono cursor-pointer hover:text-txt-secondary">#{child.id}</span>
								{/snippet}
								{#snippet popup()}
									<div class="text-sm">
										<div class="font-semibold text-txt mb-1">Text #{child.id}</div>
										<button
											onclick={() => reviewText(child.id)}
											class="block w-full text-left px-1 py-1 text-primary hover:underline"
										>Återse</button>
									</div>
								{/snippet}
							</InfoPopover>
							av
							<InfoPopover>
								{#snippet children()}
									<span>{child.authorName}</span>
								{/snippet}
								{#snippet popup()}
									<div class="space-y-1 text-sm">
										<div class="font-semibold text-txt">{child.authorName}</div>
										{#if child.author}
											<div class="text-txt-secondary">Person <span class="font-mono">#{child.author.id}</span></div>
											<div class="text-txt-secondary">{child.author.totalTexts} texter</div>
											<a href="{base}/users/{child.author.id}" class="block text-primary hover:underline">Visa profil</a>
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
