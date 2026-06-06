<script setup lang="ts">
import type { TocLink } from '@nuxtjs/mdc';
import { createReusableTemplate } from '@vueuse/core';

const props = withDefaults(defineProps<{
	links?: TocLink[];
	title?: string;
}>(), {
	links: () => [],
});

const emit = defineEmits<{
	move: [id: string];
}>();

const router = useRouter();
const nuxtApp = useNuxtApp();
const { activeHeadings, updateHeadings } = useScrollspy();

const isOpen = ref(false);

const [DefineListTemplate, ReuseListTemplate] = createReusableTemplate<{ links: TocLink[]; level: number }>();
const [DefineContentTemplate, ReuseContentTemplate] = createReusableTemplate();

function scrollToHeading(id: string) {
	router.push(`#${encodeURIComponent(id)}`);
	emit('move', id);
}

function flattenLinks(links: TocLink[]): TocLink[] {
	return links.flatMap(link => [link, ...(link.children ? flattenLinks(link.children as TocLink[]) : [])]);
}

function flattenLinksWithLevel(links: TocLink[], level = 0): { link: TocLink; level: number }[] {
	return links.flatMap(link => [
		{ link, level },
		...(link.children ? flattenLinksWithLevel(link.children as TocLink[], level + 1) : []),
	]);
}

const LINK_HEIGHT = 1.75;

const indicatorStyle = computed(() => {
	if (!activeHeadings.value?.length) return undefined;
	const flat = flattenLinks(props.links);
	const activeIndex = flat.findIndex(link => activeHeadings.value.includes(link.id));
	return {
		'--indicator-size': `${LINK_HEIGHT * activeHeadings.value.length}rem`,
		'--indicator-position': activeIndex >= 0 ? `${activeIndex * LINK_HEIGHT}rem` : '0rem',
	};
});

const circuitMaskStyle = computed(() => {
	if (!props.links.length) return undefined;
	const flat = flattenLinksWithLevel(props.links);
	const svgLinkHeight = LINK_HEIGHT * 16;
	const svgHeight = flat.length * svgLinkHeight;
	const x0 = 0.5;
	const x1 = 10.5;
	let path = '';
	let currentX = x0;
	let y = 0;

	flat.forEach((item, index) => {
		const targetX = item.level > 0 ? x1 : x0;
		const nextY = y + svgLinkHeight;
		if (index === 0) {
			path += `M${targetX} ${y}`;
			currentX = targetX;
		}
		if (targetX !== currentX) {
			path += ` L${targetX} ${y + 6}`;
			currentX = targetX;
		}
		path += ` L${currentX} ${nextY - (index < flat.length - 1 && flat[index + 1]?.level !== item.level ? 6 : 0)}`;
		y = nextY;
	});

	const svgPath = encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 ${svgHeight}'><path d='${path}' stroke='black' stroke-width='1' fill='none'/></svg>`);
	return {
		width: '0.75rem',
		height: `${flat.length * LINK_HEIGHT}rem`,
		maskImage: `url("data:image/svg+xml,${svgPath}")`,
	};
});

function refreshHeadings() {
	const flat = flattenLinks(props.links);
	if (!flat.length) {
		updateHeadings([]);
		return;
	}
	updateHeadings(Array.from(document.querySelectorAll(flat.map(l => `#${CSS.escape(l.id)}`).join(', '))));
}

const offLoadingEnd = nuxtApp.hooks.hook('page:loading:end', refreshHeadings);
const offTransitionFinish = nuxtApp.hooks.hook('page:transition:finish', refreshHeadings);

onUnmounted(() => {
	offLoadingEnd();
	offTransitionFinish();
});
</script>

<template>
	<nav class="sticky top-(--ui-header-height) z-10 bg-default/75 lg:bg-[initial] backdrop-blur -mx-4 px-4 sm:px-6 sm:-mx-6 lg:ms-0 overflow-y-auto max-h-[calc(100vh-var(--ui-header-height))]">
		<!-- eslint-disable-next-line vue/no-template-shadow -->
		<DefineListTemplate v-slot="{ links, level }">
			<ul :class="level > 0 ? 'ms-3' : 'ps-6.5 min-w-0'">
				<li
					v-for="(link, index) in links"
					:key="index"
					:class="link.children?.length ? 'ps-px' : '-ms-px min-w-0'"
				>
					<a
						:href="`#${link.id}`"
						class="group relative text-sm flex items-center focus-visible:outline-primary py-1 transition-colors"
						:class="activeHeadings.includes(link.id) ? 'text-primary' : 'text-muted hover:text-default'"
						@click.prevent="scrollToHeading(link.id)"
					>
						<span class="truncate">{{ link.text }}</span>
					</a>
					<ReuseListTemplate
						v-if="link.children?.length"
						:links="(link.children as TocLink[])"
						:level="level + 1"
					/>
				</li>
			</ul>
		</DefineListTemplate>

		<DefineContentTemplate>
			<div
				class="absolute ms-2.5 inset-s-0 top-0 rtl:-scale-x-100"
				:style="{ ...circuitMaskStyle, ...indicatorStyle }"
			>
				<div class="absolute inset-0 bg-border" />
				<div
					v-if="indicatorStyle"
					class="absolute w-full h-(--indicator-size) translate-y-(--indicator-position) transition-[translate,height] duration-200 ease-out bg-primary"
				/>
			</div>
			<ReuseListTemplate
				:links="props.links"
				:level="0"
			/>
		</DefineContentTemplate>

		<div class="pt-4 sm:pt-6 pb-2.5 sm:pb-4.5 lg:py-8 border-b border-dashed border-default lg:border-0 flex flex-col">
			<template v-if="props.links.length">
				<button
					type="button"
					class="group text-sm font-semibold flex-1 flex items-center gap-1.5 py-1.5 -mt-1.5 focus-visible:outline-primary lg:hidden"
					:data-state="isOpen ? 'open' : 'closed'"
					@click="isOpen = !isOpen"
				>
					<span class="truncate">{{ props.title ?? 'On this page' }}</span>
					<span class="ms-auto inline-flex gap-1.5 items-center">
						<UIcon
							name="lucide:chevron-down"
							class="size-5 transform transition-transform duration-200 shrink-0 group-data-[state=open]:rotate-180"
						/>
					</span>
				</button>

				<div
					class="grid transition-[grid-template-rows] duration-300 ease-out lg:hidden"
					:class="isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
				>
					<div class="relative overflow-hidden">
						<ReuseContentTemplate />
					</div>
				</div>

				<p class="text-sm font-semibold hidden items-center py-1.5 -mt-1.5 lg:flex">
					<span class="truncate">{{ props.title ?? 'On this page' }}</span>
				</p>

				<div class="relative hidden lg:flex">
					<ReuseContentTemplate />
				</div>
			</template>
		</div>
	</nav>
</template>
