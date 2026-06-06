<script setup lang="ts">
import type { DropdownMenuItem, NavigationMenuItem } from '@nuxt/ui';
import type { VariantType } from 'motion-v';
import { motion } from 'motion-v';

const { loggedIn, user, clear, openInPopup } = useUserSession();
const route = useRoute();

const dropdownItems = computed<DropdownMenuItem[][]>(() => {
	if (!user.value) return [];
	return [
		[
			{
				label: user.value.login,
				avatar: {
					src: user.value.avatarUrl,
					loading: 'lazy',
				},
				type: 'label',
			},
		],
		...(user.value.isAdmin
			? [[
					{
						label: 'New Post',
						icon: 'lucide:pencil-line',
						to: '/post/new',
					},
				]]
			: []),
		[
			{
				label: 'Logout',
				icon: 'i-lucide-log-out',
				color: 'error',
				onSelect: clear,
			},
		],
	];
});

const items = computed<NavigationMenuItem[]>(() => [{
	label: 'Home',
	to: '/',
	active: route.path === '/',
}, {
	label: 'Posts',
	to: '/posts',
	active: route.path.startsWith('/posts'),
}, {
	label: 'Changelog',
	to: '/changelog',
	active: route.path === '/changelog',
}]);

const mobileMenuVariants: { [k: string]: VariantType | ((custom: unknown) => VariantType) } = {
	normal: {
		rotate: 0,
		y: 0,
		opacity: 1,
	},
	close: (custom: unknown) => {
		const c = custom as number;
		return {
			rotate: c === 1 ? 45 : c === 3 ? -45 : 0,
			y: c === 1 ? 6 : c === 3 ? -6 : 0,
			opacity: c === 2 ? 0 : 1,
			transition: {
				type: 'spring',
				stiffness: 260,
				damping: 20,
			},
		};
	},
};
</script>

<template>
	<UHeader mode="drawer">
		<template #left>
			<NuxtLink
				to="/"
				class="flex items-center font-bold"
			>
				<Icon
					name="lucide:code-xml"
					class="mr-2 text-primary"
					size="25"
				/>
				jokelbaf.dev
			</NuxtLink>
		</template>

		<UNavigationMenu :items="items" />

		<template #right>
			<UColorModeButton />

			<UDropdownMenu
				v-if="loggedIn"
				:items="dropdownItems"
				:ui="{
					content: 'w-48',
				}"
			>
				<UButton
					color="neutral"
					variant="ghost"
					class="p-1"
					:avatar="{
						src: user!.avatarUrl,
						alt: user!.login,
						loading: 'lazy',
						class: 'size-6',
					}"
				/>
			</UDropdownMenu>
			<UButton
				v-else
				label="Login"
				aria-label="Login"
				color="neutral"
				variant="soft"
				@click="openInPopup('/auth/github', { width: 500, height: 600 })"
			/>
		</template>

		<template #toggle="{ open, toggle, ui }">
			<UButton
				size="sm"
				variant="ghost"
				color="neutral"
				square
				:class="ui.toggle({ toggleSide: 'right' })"
				@click="toggle"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="size-5"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<motion.line
						x1="4"
						y1="6"
						x2="20"
						y2="6"
						:variants="mobileMenuVariants"
						:animate="open ? 'close' : 'normal'"
						:custom="1"
						class="outline-none"
					/>
					<motion.line
						x1="4"
						y1="12"
						x2="20"
						y2="12"
						:variants="mobileMenuVariants"
						:animate="open ? 'close' : 'normal'"
						:custom="2"
						class="outline-none"
					/>
					<motion.line
						x1="4"
						y1="18"
						x2="20"
						y2="18"
						:variants="mobileMenuVariants"
						:animate="open ? 'close' : 'normal'"
						:custom="3"
						class="outline-none"
					/>
				</svg>
			</UButton>
		</template>

		<template #body>
			<UNavigationMenu
				:items="items"
				orientation="vertical"
				class="-mx-2.5"
			/>
		</template>
	</UHeader>
</template>
