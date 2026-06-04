<script setup lang="ts">
const title = 'JokelBaf\'s Blog';

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
	titleTemplate: t => t ? `${t} | ${title}` : title,
});

const description = 'A personal blog about all kind of stuff I find interesting.';

useSeoMeta({
	description,
	ogDescription: description,
	ogImage: '/meta.png',
	twitterCard: 'summary_large_image',
	themeColor: '#a684ff',
});
</script>

<template>
	<NuxtLoadingIndicator color="var(--ui-primary)" />
	<NuxtLayout>
		<NuxtPage />
	</NuxtLayout>
</template>
