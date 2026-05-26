<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui';

const links = ref<ButtonProps[]>([
	{
		label: 'Browse Posts',
		to: '/posts',
		trailingIcon: 'lucide:arrow-right',
	},
]);
</script>

<template>
	<UPageHero
		title="My Personal Blog"
		description="Welcome to my personal blog! Here I share my experience with all kind of things: development, reversing and much more!"
		headline="By JokelBaf"
		:links="links"

		orientation="horizontal"
	>
		<PostItemsMarquee class="hidden lg:flex" />
	</UPageHero>
</template>
