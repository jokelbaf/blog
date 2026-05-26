<script setup lang="ts">
defineProps<{
	name: string;
	size: string;
	url: string;
}>();
</script>

<template>
	<div class="not-prose flex items-center gap-3 p-4 rounded-xl border border-default bg-elevated">
		<div class="flex items-center justify-center size-10 rounded-lg bg-muted shrink-0">
			<UIcon
				name="i-lucide-file"
				class="text-lg text-muted"
			/>
		</div>
		<div class="flex-1 min-w-0">
			<p class="text-sm font-medium truncate">
				{{ name }}
			</p>
			<p class="text-xs text-muted">
				{{ size }}
			</p>
		</div>
		<UButton
			:to="url"
			download
			target="_blank"
			icon="i-lucide-download"
			color="neutral"
			variant="ghost"
			size="sm"
		/>
	</div>
</template>
