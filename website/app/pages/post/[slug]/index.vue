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
</script>

<template>
	<Post :post="post!" />
</template>
