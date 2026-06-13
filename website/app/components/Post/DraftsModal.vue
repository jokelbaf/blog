<script setup lang="ts">
import { refDebounced } from '@vueuse/core';
import type { SerializeObject } from 'nitropack';

import type { Post } from '../../../shared/types/post';

const emit = defineEmits<{ close: [] }>();
const router = useRouter();

const search = ref('');
const debouncedSearch = refDebounced(search, 300);
const drafts = ref<SerializeObject<Post>[]>([]);
const pending = ref(false);
const showSpinner = ref(false);

async function fetchDrafts() {
	pending.value = true;

	const spinnerTimer = setTimeout(() => {
		showSpinner.value = true;
	}, 200);

	try {
		const draftPosts = await $fetch('/api/drafts', {
			query: { search: debouncedSearch.value || undefined },
		});
		drafts.value = draftPosts;
	} finally {
		clearTimeout(spinnerTimer);
		pending.value = false;
		showSpinner.value = false;
	}
}

onMounted(fetchDrafts);
watch(debouncedSearch, fetchDrafts);

function navigateToDraft(slug: string) {
	emit('close');
	router.push(`/post/${slug}/edit`);
}
</script>

<template>
	<UModal
		title="Drafts"
		:close="{ onClick: () => emit('close') }"
	>
		<template #body>
			<div class="pb-4 border-b border-default">
				<UInput
					v-model="search"
					placeholder="Search drafts..."
					icon="i-lucide-search"
					class="w-full"
					autofocus
				/>
			</div>

			<div class="overflow-y-auto max-h-105">
				<div
					v-if="showSpinner"
					class="flex items-center justify-center py-12"
				>
					<UIcon
						name="i-lucide-loader-circle"
						class="size-6 text-muted animate-spin"
					/>
				</div>

				<div
					v-else-if="!drafts.length"
					class="flex flex-col items-center justify-center py-12 gap-2"
				>
					<UIcon
						name="i-lucide-file-x"
						class="size-8 text-muted"
					/>
					<p class="text-sm text-muted">
						{{ search ? 'No drafts match your search' : 'No drafts yet' }}
					</p>
				</div>

				<div
					v-else
					class="divide-y divide-default"
				>
					<button
						v-for="draft in drafts"
						:key="draft.id"
						class="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-elevated transition-colors cursor-pointer"
						@click="navigateToDraft(draft.slug)"
					>
						<div
							v-if="draft.thumbnail"
							class="shrink-0 size-10 rounded overflow-hidden bg-muted"
						>
							<img
								:src="getFileUrl(draft.thumbnail.uid, draft.thumbnail.ext)"
								:alt="draft.title"
								class="size-full object-cover"
							>
						</div>
						<div
							v-else
							class="shrink-0 size-10 rounded bg-muted flex items-center justify-center"
						>
							<UIcon
								name="i-lucide-file-text"
								class="size-4 text-muted"
							/>
						</div>

						<div class="min-w-0 flex-1">
							<p class="text-sm font-medium truncate">
								{{ draft.title }}
							</p>
							<p class="text-xs text-muted truncate mt-0.5">
								{{ draft.description }}
							</p>
						</div>

						<p class="shrink-0 text-xs text-muted/60">
							{{ formatPostDate(draft.createdAt) }}
						</p>
					</button>
				</div>
			</div>
		</template>
	</UModal>
</template>
