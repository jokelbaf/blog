<script setup lang="ts">
const title = 'Posts';
const ogTitle = `${title} | JokelBaf's Blog`;
const description = 'Explore and search posts on my blog website!';

useSeoMeta({
	title,
	ogTitle,
	description,
	ogDescription: description,
});
</script>

<template>
	<PostItemsPage />
</template>
