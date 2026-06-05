<script setup lang="ts">
const route = useRoute();

const slug = route.params.slug as string;

const { data: post, error } = await useFetch(`/api/post/${slug}`);

if (error.value) {
	throw createError({
		statusCode: error.value.status || 500,
		message: error.value.data?.message || 'Failed to fetch post',
		fatal: true,
	});
}

useSeoMeta({
	title: post.value?.title,
	description: post.value?.description,

	ogTitle: `${post.value?.title} | JokelBaf's Blog`,
	ogDescription: post.value?.description,

	ogType: 'article',
	author: post.value?.author.name,
	articlePublishedTime: post.value?.createdAt,
});

defineOgImage('BlogPostCard', {
	title: post.value!.title,
	description: post.value!.description,
	author: post.value!.author.name,
	readTimeSec: post.value!.readTimeSec,
	date: formatPostDate(post.value!.createdAt),
});
</script>

<template>
	<Post :post="post!" />
</template>
