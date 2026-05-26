<script setup lang="ts">
import type { Post } from '../../../shared/types/post';
import type { SerializeObject } from 'nitropack';

const props = defineProps<{
	post: SerializeObject<Post>;
}>();
const post = props.post;

const image = post.thumbnail
	? {	src: getFileUrl(post.thumbnail.uid, post.thumbnail.ext) }
	: undefined;
</script>

<template>
	<UBlogPost
		:title="post.title"
		:description="post.description"
		:date="post.createdAt"
		:image="image"
		:to="getPostUrl(post.slug)"
	/>
</template>
