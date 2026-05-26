<script setup lang="ts">
import type { SerializeObject } from 'nitropack';
import type { PostDetail } from '../../../../shared/types/post';
import { getFileUrl } from '../../../utils/post';

const props = defineProps<{
	post?: SerializeObject<PostDetail>;
}>();
const post = props.post;

const title = ref(post?.title ?? '');
const description = ref(post?.description ?? '');
const content = ref(post?.content ?? '');

const titleEl = useTemplateRef<HTMLElement>('titleEl');
const descEl = useTemplateRef<HTMLElement>('descEl');

onMounted(() => {
	if (titleEl.value) titleEl.value.innerText = title.value;
	if (descEl.value) descEl.value.innerText = description.value;
});

const { handleFileInput, files } = useFileStorage({ clearOldFiles: true });
const thumbnailInputEl = useTemplateRef<HTMLInputElement>('thumbnailInput');

const thumbnailObjectUrl = ref<string | null>(null);

watch(() => files.value?.[0], (file) => {
	thumbnailObjectUrl.value = file?.content as string ?? null;
});

const thumbnailSrc = computed(() => {
	if (thumbnailObjectUrl.value) return thumbnailObjectUrl.value;
	if (post?.thumbnail) return getFileUrl(post.thumbnail.uid, post.thumbnail.ext);
	return null;
});

const loading = ref(false);
const toast = useToast();
const router = useRouter();

async function submit() {
	if (!title.value.trim() || !description.value.trim() || !content.value.trim()) {
		toast.add({ title: 'Title, description and content are all required', color: 'error' });
		return;
	}

	loading.value = true;

	try {
		const thumbnail = files.value?.[0] ?? undefined;

		if (post) {
			await $fetch('/api/post', {
				method: 'PATCH',
				body: {
					id: post.id,
					title: title.value.trim(),
					description: description.value.trim(),
					content: content.value,
					...(thumbnail && { thumbnail }),
				},
			});
			toast.add({ title: 'Post updated', color: 'success' });
		} else {
			const newPost = await $fetch('/api/post', {
				method: 'POST',
				body: {
					title: title.value.trim(),
					description: description.value.trim(),
					content: content.value,
					...(thumbnail && { thumbnail }),
				},
			});
			toast.add({ title: 'Post created', color: 'success' });
			await router.push(`/post/${newPost.slug}/edit`);
		}
	} catch (e) {
		const message = e instanceof Error ? e.message : (e as { data?: { message?: string } })?.data?.message ?? 'Unknown error';
		toast.add({
			title: 'Something went wrong',
			description: message,
			color: 'error',
		});
	} finally {
		loading.value = false;
	}
}
</script>

<template>
	<UCard
		class="min-h-[80vh] flex flex-col"
		:ui="{ root: 'rounded-lg overflow-visible', header: 'sm:pt-6', body: 'flex-1' }"
	>
		<template #header>
			<div
				class="relative w-full h-64 cursor-pointer overflow-hidden bg-muted group rounded-md"
				@click="thumbnailInputEl?.click()"
			>
				<img
					v-if="thumbnailSrc"
					:src="thumbnailSrc"
					alt="Post thumbnail"
					class="w-full h-full object-cover"
				>

				<div
					v-if="!thumbnailSrc"
					class="absolute inset-0 flex flex-col items-center justify-center gap-2"
				>
					<UIcon
						name="i-lucide-image-plus"
						class="size-8 text-muted"
					/>
					<p class="text-sm text-muted">
						Click to add a thumbnail
					</p>
				</div>

				<div
					v-else
					class="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
				>
					<UIcon
						name="i-lucide-image"
						class="size-6 text-white"
					/>
					<p class="text-sm text-white">
						Change thumbnail
					</p>
				</div>

				<input
					ref="thumbnailInput"
					type="file"
					accept="image/*"
					class="hidden"
					@change="handleFileInput"
				>
			</div>

			<div class="px-6 pt-6 pb-5 space-y-3">
				<div
					ref="titleEl"
					contenteditable="true"
					data-placeholder="Post title"
					class="text-3xl font-bold focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-muted empty:before:font-normal"
					@input="title = ($event.target as HTMLElement).innerText"
					@keydown.enter.prevent
				/>
				<div
					ref="descEl"
					contenteditable="true"
					data-placeholder="Short description..."
					class="text-base text-muted focus:outline-none empty:before:content-[attr(data-placeholder)]"
					@input="description = ($event.target as HTMLElement).innerText"
				/>
			</div>
		</template>

		<PostEditorCore v-model:content="content" />

		<template #footer>
			<div class="flex justify-end">
				<UButton
					:label="post ? 'Update Post' : 'Create Post'"
					:loading="loading"
					@click="submit"
				/>
			</div>
		</template>
	</UCard>
</template>
