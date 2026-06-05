<script setup lang="ts">
const props = defineProps<{
	title: string;
	description: string;
	author: string;
	avatarUrl?: string;
	readTimeSec: number;
	date: string;
}>();

const readTimeMin = Math.max(1, Math.ceil(props.readTimeSec / 60));
const initial = props.author?.[0]?.toUpperCase() ?? 'J';
const truncatedDescription = props.description?.length > 140
	? props.description.slice(0, 137) + '...'
	: props.description;
</script>

<template>
	<div class="w-300 h-157.5 flex flex-col bg-zinc-950 relative overflow-hidden">
		<div
			class="absolute -top-35 -right-25 w-140 h-115 rounded-full"
			style="background: radial-gradient(circle, rgba(139,92,246,0.30) 0%, transparent 70%)"
		/>
		<div
			class="absolute -bottom-25 -left-20 w-95 h-85 rounded-full"
			style="background: radial-gradient(circle, rgba(109,40,217,0.18) 0%, transparent 70%)"
		/>

		<div
			class="absolute top-0 left-0 right-0 h-px"
			style="background: linear-gradient(to right, transparent 0%, rgba(167,114,255,0.7) 50%, transparent 100%)"
		/>

		<div class="relative z-10 flex flex-col justify-between h-full px-18 py-14">
			<div class="flex items-center gap-3">
				<Icon
					name="lucide:code-xml"
					mode="svg"
					class="text-violet-400"
					style="width: 26px; height: 26px"
				/>
				<span class="text-zinc-300 font-bold text-[20px] tracking-[0.01em]">blog.jokelbaf.dev</span>
			</div>

			<div class="flex flex-col gap-5">
				<h1
					class="font-bold text-white leading-[1.18] tracking-[-0.02em]"
					style="font-size: 56px; max-width: 920px"
				>
					{{ title }}
				</h1>
				<p
					class="text-zinc-400 leading-[1.65]"
					style="font-size: 23px; max-width: 830px"
				>
					{{ truncatedDescription }}
				</p>
			</div>

			<div class="flex items-center gap-4">
				<div class="flex items-center gap-3">
					<img
						v-if="avatarUrl"
						:src="avatarUrl"
						width="36"
						height="36"
						class="w-9 h-9 rounded-full object-cover"
					>
					<div
						v-else
						class="w-9 h-9 rounded-full flex items-center justify-center"
						style="background: rgba(139,92,246,0.22)"
					>
						<span class="text-violet-300 font-semibold text-[14px]">{{ initial }}</span>
					</div>
					<span class="text-zinc-200 font-medium text-[17px]">{{ author }}</span>
				</div>
				<span class="text-zinc-600 text-[17px]">·</span>
				<span class="text-zinc-500 text-[17px]">{{ readTimeMin }} min read</span>
				<span class="text-zinc-600 text-[17px]">·</span>
				<span class="text-zinc-500 text-[17px]">{{ date }}</span>
			</div>
		</div>

		<div
			class="absolute right-0 top-0 bottom-0 w-px"
			style="background: linear-gradient(to bottom, transparent 0%, rgba(139,92,246,0.4) 40%, rgba(139,92,246,0.4) 60%, transparent 100%)"
		/>
	</div>
</template>
