<script setup lang="ts">
import type { NodeViewProps } from '@tiptap/vue-3';
import { NodeViewWrapper } from '@tiptap/vue-3';

const props = defineProps<NodeViewProps>();
</script>

<template>
	<NodeViewWrapper :class="props.selected ? 'ring-2 ring-primary rounded-xl' : ''">
		<PostFile
			:name="props.node.attrs.name"
			:size="props.node.attrs.size"
			:url="props.node.attrs.url"
		/>
	</NodeViewWrapper>
</template>
