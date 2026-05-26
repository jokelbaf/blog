<script setup lang="ts">
import type { SerializeObject } from 'nitropack';

const { user } = useUserSession();
const toast = useToast();

const props = defineProps<{
	post: SerializeObject<PostDetail>;
}>();
const post = props.post;

const comments = ref(post.comments);

const inputComment = ref('');
const commentLoading = ref(false);

async function submitComment() {
	const content = inputComment.value.trim();
	if (content === '') return;

	commentLoading.value = true;

	try {
		const comment = await $fetch(`/api/post/${post.slug}/comment`, {
			method: 'POST',
			body: {
				content,
				postId: post.id,
			},
		});
		toast.add({ title: 'Comment added' });
		comments.value.push(comment);
		inputComment.value = '';
	} catch (e) {
		const message = e instanceof Error ? e.message : (e as { data?: { message?: string } })?.data?.message ?? 'Unknown error';
		toast.add({
			title: 'Something went wrong',
			description: message,
			color: 'error',
		});
	} finally {
		commentLoading.value = false;
	}
}
</script>

<template>
	<div>
		<div
			class="mt-8 mb-4 py-4"
			:class="{ 'border-b border-default': comments.length > 0 }"
		>
			<h1 class="text-1xl sm:text-2xl font-bold text-highlighted">
				{{ comments.length }} {{ comments.length === 1 ? 'Comment' : 'Comments' }}
			</h1>
		</div>

		<div
			v-if="user"
			class="mb-6 pt-2"
		>
			<div class="flex gap-3">
				<UAvatar
					:src="user.avatarUrl"
					:alt="user.name"
				/>
				<UTextarea
					v-model="inputComment"
					placeholder="Write a comment..."
					class="flex-1"
					maxlength="256"
					minlength="1"
				/>
			</div>
			<div class="flex justify-between pl-11 mt-2">
				<div
					class="text-sm text-muted transition-opacity"
					:class="inputComment.length > 0 ? 'opacity-100' : 'opacity-0'"
				>
					{{ inputComment.length }} / 256
				</div>
				<UButton
					:disabled="inputComment.trim() === ''"
					:loading="commentLoading"
					color="primary"
					@click="submitComment"
				>
					Comment
				</UButton>
			</div>
		</div>

		<div v-if="comments.length > 0">
			<PostComment
				v-for="comment in comments"
				:key="comment.id"
				:post="post"
				:comment="comment"
			/>
		</div>
		<div
			v-else
			class="text-muted"
		>
			{{ user ? 'Be the first to comment!' : 'No comments yet.' }}
		</div>
	</div>
</template>
