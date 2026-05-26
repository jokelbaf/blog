<script setup>
useHead({
	meta: [
		{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
	],
	link: [
		{ rel: 'icon', href: '/favicon.ico' },
	],
	htmlAttrs: {
		lang: 'en',
	},
});

const title = 'JokelBaf\'s Blog';
const description = 'A personal blog about all kind of stuff I find interesting.';

useSeoMeta({
	title,
	description,
	ogTitle: title,
	ogDescription: description,
	ogImage: '/meta.png',
	twitterCard: 'summary_large_image',
});
</script>

<template>
	<NuxtLoadingIndicator color="var(--ui-primary)" />
	<NuxtLayout>
		<NuxtPage />
	</NuxtLayout>
</template>
