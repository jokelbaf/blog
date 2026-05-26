<script setup lang="ts">
const icons = [
	{
		url: 'https://github.com/jokelbaf',
		icon: 'simple-icons:github',
		label: 'GitHub',
	},
	{
		url: 'https://discord.com/users/491588676074078218',
		icon: 'simple-icons:discord',
		label: 'Discord',
	},
	{
		url: 'https://t.me/jokelbaf',
		icon: 'simple-icons:telegram',
		label: 'Telegram',
	},
	{
		url: 'https://twitter.com/jokelbaf',
		icon: 'simple-icons:twitter',
		label: 'Twitter',
	},
];
</script>

<template>
	<UFooter>
		<template #left>
			<p class="text-sm text-muted">
				Built with 💜 by JokelBaf
			</p>
		</template>

		<template #right>
			<UButton
				v-for="item in icons"
				:key="item.label"
				:to="item.url"
				target="_blank"
				:icon="item.icon"
				:aria-label="item.label"
				color="neutral"
				variant="ghost"
				class="hover:text-primary"
			/>
		</template>
	</UFooter>
</template>
