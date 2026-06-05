<script setup lang="ts">
import type { SerializeObject } from 'nitropack';
import type { ButtonProps } from '@nuxt/ui';

import { formatPostDate, getReadTimeMin } from '../../utils/post';

const toast = useToast();
const { user } = useUserSession();

const props = defineProps<{
	post: SerializeObject<PostDetail>;
}>();
const post = props.post;

const links = ref<ButtonProps[]>([
	...user.value?.isAdmin
		? [{
				label: 'Edit Post',
				to: `/post/${post.slug}/edit`,
				icon: 'lucide:pencil-line',
			}]
		: [],
	{
		label: 'Share',
		icon: 'lucide:share-2',
		onClick() {
			navigator.clipboard.writeText(window.location.href);
			toast.add({ title: 'Link copied to clipboard' });
		},
	},
]);
</script>

<template>
	<div class="relative border-b border-default py-8">
		<div class="flex flex-row items-center justify-between gap-4">
			<div class="mb-3 flex items-center gap-2">
				<UAvatar
					:src="post.author.avatarUrl"
				/>
				<div>
					<div class="text-sm font-semibold text-primary">
						{{ post.author.name }}
					</div>
					<div class="text-sm text-muted">
						{{ formatPostDate(post.createdAt) }}
					</div>
				</div>
			</div>
			<div class="text-base text-muted">
				{{ getReadTimeMin(post.readTimeSec) }} min read
			</div>
		</div>
		<div>
			<div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
				<h1 class="text-3xl sm:text-4xl text-pretty font-bold text-highlighted">
					{{ post.title }}
				</h1>
				<div class="flex flex-wrap items-center gap-1.5">
					<UButton
						v-for="(link, index) in links"
						:key="index"
						color="neutral"
						variant="outline"
						v-bind="link"
					/>
				</div>
			</div>
			<div class="text-lg text-pretty text-muted mt-4">
				{{ post.description }}
			</div>
		</div>
	</div>
</template>
