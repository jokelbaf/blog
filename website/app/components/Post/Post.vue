<script setup lang="ts">
import type { SerializeObject } from 'nitropack';
import type { DefineComponent } from 'vue';
import { parseMarkdown } from '@nuxtjs/mdc/runtime';

import type { PostDetail } from '../../../shared/types/post';
import PostFileVue from '~/components/Post/File.vue';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mdcComponents: Record<string, string | DefineComponent<any, any, any>> = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	PostFile: PostFileVue as unknown as DefineComponent<any, any, any>,
};

const props = defineProps<{
	post: SerializeObject<PostDetail>;
}>();
const post = props.post;

const { data: parsed } = await useAsyncData(
	`post-content-${post.slug}`,
	() => parseMarkdown(post.content),
);

const tocLinks = computed(() => parsed.value?.toc?.links ?? []);
</script>

<template>
	<UPage
		class="container mx-auto px-4 sm:px-6 lg:px-8 md:py-8"
	>
		<UPageBody :ui="{ base: 'pb-8' }">
			<img
				v-if="post.thumbnail"
				:src="getFileUrl(post.thumbnail.uid, post.thumbnail.ext)"
				:alt="post.title"
				class="w-full h-64 object-cover rounded-lg m-0"
			>
			<PostHeader :post="post" />
			<MDCRenderer
				v-if="parsed?.body"
				tag="article"
				:body="parsed.body"
				:data="parsed.data ?? {}"
				:components="mdcComponents"
			/>
			<PostComments :post="post" />
		</UPageBody>
		<template
			v-if="tocLinks.length"
			#right
		>
			<PostTOC :links="tocLinks" />
		</template>
	</UPage>
</template>
