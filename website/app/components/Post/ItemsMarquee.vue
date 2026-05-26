<script setup lang="ts">
const { data: posts, error } = await useFetch('/api/posts');

if (error.value) {
	throw createError({
		statusCode: error.value.statusCode || 500,
		message: error.value.data?.message || 'Failed to fetch post',
		fatal: true,
	});
}

const targetPosts = computed(() => {
	if (!posts.value) return [];
	return posts.value.slice(0, 5);
});
</script>

<template>
	<UMarquee
		orientation="vertical"
		pause-on-hover
		:ui="{
			root: 'max-h-96 [--gap:--spacing(8)]',
		}"
	>
		<PostItem
			v-for="post in targetPosts"
			:key="post.id"
			:post="post"
			class="max-w-sm xl:max-w-lg"
		/>
	</UMarquee>
</template>
