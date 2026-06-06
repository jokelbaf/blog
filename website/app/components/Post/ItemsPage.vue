<script setup lang="ts">
import { refDebounced } from '@vueuse/core';

interface OrderItem<V extends string> {
	label: string;
	icon: string;
	value: V;
}

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

const orderByItems = ref<OrderItem<typeof orderBy['value']>[]>([
	{
		label: 'Date',
		icon: 'lucide:calendar',
		value: 'createdAt',
	},
	{
		label: 'Title',
		icon: 'lucide:type',
		value: 'title',
	},
]);

const orderByLabel = computed(() => orderByItems.value.find(i => i.value === orderBy.value)?.label);

const orderDirItems = ref<OrderItem<typeof orderDir['value']>[]>([
	{
		label: 'Ascending',
		icon: 'lucide:arrow-up',
		value: 'asc',
	},
	{
		label: 'Descending',
		icon: 'lucide:arrow-down',
		value: 'desc',
	},
]);

const orderDirLabel = computed(() => orderDirItems.value.find(i => i.value === orderDir.value)?.label);
</script>

<template>
	<div>
		<UContainer class="pb-8 space-y-8">
			<UPageHeader
				title="Posts"
				description="Browse the latest posts on my blog. You can also use the search bar and filters to find specific posts."
			/>
			<div class="flex justify-between items-center gap-3">
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
							base: 'h-8',
							content: 'w-auto min-w-(--reka-select-trigger-width)',
							trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200',
						}"
					>
						<template #default>
							<span class="inline-block w-0 overflow-hidden whitespace-nowrap sm:w-auto">{{ orderByLabel }}</span>
						</template>
					</USelect>
					<USelect
						v-model="orderDir"
						:items="orderDirItems"
						icon="lucide:arrow-up-down"
						:ui="{
							base: 'h-8',
							content: 'w-auto min-w-(--reka-select-trigger-width)',
							trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200',
						}"
					>
						<template #default>
							<span class="inline-block w-0 overflow-hidden whitespace-nowrap sm:w-auto">{{ orderDirLabel }}</span>
						</template>
					</USelect>
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
			<div
				v-if="!posts?.length"
				class="flex flex-col items-center justify-center w-full h-80"
			>
				<UIcon
					name="lucide:box"
					class="w-16 h-16 text-muted mb-4"
				/>
				<p class="text-lg font-medium text-muted">
					No posts found
				</p>
			</div>
		</UContainer>
	</div>
</template>
