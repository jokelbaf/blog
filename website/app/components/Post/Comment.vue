<script setup lang="ts">
import type { SerializeObject } from 'nitropack';
import type { DefineComponent } from 'vue';

import CommentProsePVue from './CommentProseP.vue';

const { user } = useUserSession();
const toast = useToast();

const likeLoading = ref(false);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mdcComponents: Record<string, DefineComponent<any, any, any>> = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	p: CommentProsePVue as unknown as DefineComponent<any, any, any>,
};

const props = defineProps<{
	post: SerializeObject<PostDetail>;
	comment: SerializeObject<PostComment>;
}>();
const comment = ref(props.comment);

async function submitLike() {
	likeLoading.value = true;

	try {
		await $fetch(`/api/comment/${comment.value.id}/like`, {
			method: 'PATCH',
		});
		toast.add({ title: 'Like updated' });
		comment.value.likedByAuthor = !comment.value.likedByAuthor;
	} catch (e) {
		const message = e instanceof Error ? e.message : (e as { data?: { message?: string } })?.data?.message ?? 'Unknown error';
		toast.add({
			title: 'Something went wrong',
			description: message,
			color: 'error',
		});
	} finally {
		likeLoading.value = false;
	}
}
</script>

<template>
	<div class="border-b border-default last:border-b-0 p-4 mb-4">
		<div class="flex items-center gap-2">
			<UAvatar
				:src="comment.author.avatarUrl"
				:alt="comment.author.name"
				loading="lazy"
			/>
			<span class="font-semibold">{{ comment.author.name }}</span>
			<span class="text-sm text-gray-500 ml-auto">{{ new Date(comment.createdAt).toLocaleString() }}</span>
		</div>
		<MDC :value="comment.content">
			<template #default="{ body, data }">
				<MDCRenderer
					:body="body"
					:data="data"
					:components="mdcComponents"
				/>
			</template>
		</MDC>
		<div
			v-if="user"
			class="flex"
		>
			<UButton
				variant="ghost"
				:ui="{
					base: 'rounded-full p-1.5',
				}"
				:disabled="user.id !== post.author.id"
				@click="submitLike"
			>
				<div
					v-if="comment.likedByAuthor"
					class="relative w-full h-full"
				>
					<UAvatar
						:src="post.author.avatarUrl"
						:alt="post.author.name"
						size="xs"
						loading="lazy"
					/>
					<UIcon
						name="material-symbols:favorite"
						class="absolute -right-1 -bottom-1 text-red-500 size-4"
					/>
				</div>
				<UIcon
					v-else
					name="material-symbols:favorite-outline"
					class="text-muted size-5"
				/>
			</UButton>
		</div>
	</div>
</template>
