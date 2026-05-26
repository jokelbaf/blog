<script setup lang="ts">
import type { SelectItem } from '@nuxt/ui';
import { refDebounced } from '@vueuse/core';

const route = useRoute();
const router = useRouter();

const search = ref<string>((route.query.search as string) ?? '');
const debouncedSearch = refDebounced(search, 300);

const orderBy = ref<'createdAt' | 'title'>((route.query.orderBy as 'createdAt' | 'title') ?? 'createdAt');
const orderDir = ref<'asc' | 'desc'>((route.query.orderDir as 'asc' | 'desc') ?? 'desc');

watch([debouncedSearch, orderBy, orderDir], ([s, o, d]) => {
	router.replace({ query: { search: s || undefined, orderBy: o, orderDir: d } });
});

const { data: posts, error } = await useFetch('/api/posts', {
	query: { search: debouncedSearch, orderBy, orderDir },
});

if (error.value) {
	throw createError({
		statusCode: error.value.statusCode || 500,
		message: error.value.data?.message || 'Failed to fetch posts',
		fatal: true,
	});
}

const orderByItems = ref<SelectItem[]>([
	{
		type: 'item',
		label: 'Date',
		icon: 'lucide:calendar',
		value: 'createdAt',
	},
	{
		type: 'item',
		label: 'Title',
		icon: 'lucide:type',
		value: 'title',
	},
]);

const orderDirItems = ref<SelectItem[]>([
	{
		type: 'item',
		label: 'Ascending',
		icon: 'lucide:arrow-up',
		value: 'asc',
	},
	{
		type: 'item',
		label: 'Descending',
		icon: 'lucide:arrow-down',
		value: 'desc',
	},
]);
</script>

<template>
	<div>
		<UContainer class="pb-8 space-y-8">
			<UPageHeader
				title="Posts"
				description="Browse the latest posts on my blog. You can also use the search bar and filters to find specific posts."
			/>
			<div class="flex justify-between items-center">
				<UInput
					v-model="search"
					placeholder="Search..."
					icon="lucide:search"
				/>
				<div class="flex items-center gap-4">
					<USelect
						v-model="orderBy"
						:items="orderByItems"
						icon="lucide:list-chevrons-up-down"
						:ui="{
							trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200',
						}"
					/>
					<USelect
						v-model="orderDir"
						:items="orderDirItems"
						icon="lucide:arrow-up-down"
						:ui="{
							trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200',
						}"
					/>
				</div>
			</div>
		</UContainer>
		<UContainer class="pb-12">
			<UBlogPosts :ui="{ base: 'lg:gap-y-12' }">
				<PostItem
					v-for="post in posts"
					:key="post.id"
					:post="post"
				/>
			</UBlogPosts>
		</UContainer>
	</div>
</template>
