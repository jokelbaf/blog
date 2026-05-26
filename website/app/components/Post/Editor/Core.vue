<script setup lang="ts">
import type { EditorCustomHandlers, EditorToolbarItem, EditorSuggestionMenuItem, DropdownMenuItem } from '@nuxt/ui';
import type { Editor, JSONContent } from '@tiptap/vue-3';
import { NodeSelection } from '@tiptap/pm/state';
import { upperFirst } from 'scule';
import { mapEditorItems } from '@nuxt/ui/utils/editor';
import { CodeBlockShiki } from 'tiptap-extension-code-block-shiki';

import { PostFileExtension } from './PostFileExtension';
import { useEditorCompletion } from './UseCompletion';
import EditorLinkPopover from './LinkPopover.vue';

type MarkdownHelpers = {
	createNode: (type: string, attrs: Record<string, unknown>, content: unknown[]) => unknown;
	createTextNode: (text: string) => unknown;
	renderChildren: (content: unknown) => string;
};

type MarkdownNode = { attrs?: { language?: string }; content?: unknown };

const codeBlockExtension = CodeBlockShiki.extend({
	markdownTokenName: 'code',
	parseMarkdown(token: Record<string, unknown>, helpers?: unknown) {
		const h = helpers as MarkdownHelpers;
		if (!(token.raw as string | undefined)?.startsWith('```')
			&& !(token.raw as string | undefined)?.startsWith('~~~')
			&& token.codeBlockStyle !== 'indented') {
			return [];
		}
		return h.createNode(
			'codeBlock',
			{ language: (token.lang as string | null) || null },
			token.text ? [h.createTextNode(token.text as string)] : [],
		);
	},
	renderMarkdown(node: unknown, helpers?: unknown) {
		const { attrs, content } = node as MarkdownNode;
		const h = helpers as MarkdownHelpers;
		const language = attrs?.language || '';
		if (!content) {
			return `\`\`\`${language}\n\n\`\`\``;
		}
		return [`\`\`\`${language}`, h.renderChildren(content), '```'].join('\n');
	},
}).configure({
	defaultTheme: 'material-theme',
	themes: {
		light: 'material-theme-lighter',
		dark: 'material-theme-palenight',
	},
});

const editorRef = useTemplateRef('editorRef');

const value = defineModel<string>('content', { default: '' });

const imageModalOpen = ref(false);
const fileModalOpen = ref(false);
const imageReplaceState = ref<{ pos: number; nodeSize: number } | null>(null);

watch(imageModalOpen, (isOpen) => {
	if (!isOpen) imageReplaceState.value = null;
});

const { extension: completionExtension, handlers: aiHandlers, isLoading: aiLoading } = useEditorCompletion(editorRef);

function onImageConfirm(src: string, alt: string) {
	const editor = editorRef.value?.editor;
	if (!editor) return;

	if (imageReplaceState.value) {
		const { pos, nodeSize } = imageReplaceState.value;
		editor.chain().focus()
			.deleteRange({ from: pos, to: pos + nodeSize })
			.insertContentAt(pos, { type: 'image', attrs: { src, alt } })
			.run();
	} else {
		editor.chain().focus().insertContent({ type: 'image', attrs: { src, alt } }).run();
	}
}

function onFileConfirm(name: string, size: number, url: string) {
	const editor = editorRef.value?.editor;
	if (!editor) return;

	editor.chain().focus().insertContent({
		type: 'postFile',
		attrs: { name, size: formatFileSize(size), url },
	}).run();
}

const customHandlers = {
	imageUpload: {
		canExecute: () => true,
		execute: (editor: Editor) => {
			imageModalOpen.value = true;
			return editor.chain();
		},
		isActive: () => false,
		isDisabled: undefined,
	},
	fileUpload: {
		canExecute: () => true,
		execute: (editor: Editor) => {
			fileModalOpen.value = true;
			return editor.chain();
		},
		isActive: () => false,
		isDisabled: undefined,
	},
	...aiHandlers,
} satisfies EditorCustomHandlers;

const fixedToolbarItems = [[{
	kind: 'undo',
	icon: 'i-lucide-undo',
	tooltip: { text: 'Undo' },
}, {
	kind: 'redo',
	icon: 'i-lucide-redo',
	tooltip: { text: 'Redo' },
}], [{
	icon: 'i-lucide-heading',
	tooltip: { text: 'Headings' },
	content: { align: 'start' },
	items: [{
		kind: 'heading',
		level: 1,
		icon: 'i-lucide-heading-1',
		label: 'Heading 1',
	}, {
		kind: 'heading',
		level: 2,
		icon: 'i-lucide-heading-2',
		label: 'Heading 2',
	}, {
		kind: 'heading',
		level: 3,
		icon: 'i-lucide-heading-3',
		label: 'Heading 3',
	}, {
		kind: 'heading',
		level: 4,
		icon: 'i-lucide-heading-4',
		label: 'Heading 4',
	}],
}, {
	icon: 'i-lucide-list',
	tooltip: { text: 'Lists' },
	content: { align: 'start' },
	items: [{
		kind: 'bulletList',
		icon: 'i-lucide-list',
		label: 'Bullet List',
	}, {
		kind: 'orderedList',
		icon: 'i-lucide-list-ordered',
		label: 'Ordered List',
	}],
}, {
	kind: 'blockquote',
	icon: 'i-lucide-text-quote',
	tooltip: { text: 'Blockquote' },
}, {
	kind: 'codeBlock',
	icon: 'i-lucide-square-code',
	tooltip: { text: 'Code Block' },
}], [{
	kind: 'mark',
	mark: 'bold',
	icon: 'i-lucide-bold',
	tooltip: { text: 'Bold' },
}, {
	kind: 'mark',
	mark: 'italic',
	icon: 'i-lucide-italic',
	tooltip: { text: 'Italic' },
}, {
	kind: 'mark',
	mark: 'underline',
	icon: 'i-lucide-underline',
	tooltip: { text: 'Underline' },
}, {
	kind: 'mark',
	mark: 'strike',
	icon: 'i-lucide-strikethrough',
	tooltip: { text: 'Strikethrough' },
}, {
	kind: 'mark',
	mark: 'code',
	icon: 'i-lucide-code',
	tooltip: { text: 'Code' },
}], [{
	slot: 'link' as const,
	icon: 'i-lucide-link',
}, {
	kind: 'imageUpload',
	icon: 'i-lucide-image',
	tooltip: { text: 'Image' },
}, {
	kind: 'fileUpload',
	icon: 'i-lucide-paperclip',
	tooltip: { text: 'File' },
}]] satisfies EditorToolbarItem<typeof customHandlers>[][];

const bubbleToolbarItems = computed(() => [[{
	icon: 'i-lucide-sparkles',
	label: 'Improve',
	activeColor: 'neutral',
	activeVariant: 'ghost',
	loading: aiLoading.value,
	content: { align: 'start' },
	items: [{
		kind: 'aiFix',
		icon: 'i-lucide-spell-check',
		label: 'Fix spelling & grammar',
	}, {
		kind: 'aiExtend',
		icon: 'i-lucide-unfold-vertical',
		label: 'Extend text',
	}, {
		kind: 'aiReduce',
		icon: 'i-lucide-fold-vertical',
		label: 'Reduce text',
	}, {
		kind: 'aiSimplify',
		icon: 'i-lucide-lightbulb',
		label: 'Simplify text',
	}, {
		kind: 'aiContinue',
		icon: 'i-lucide-text',
		label: 'Continue sentence',
	}, {
		kind: 'aiSummarize',
		icon: 'i-lucide-list',
		label: 'Summarize',
	}],
}], [{
	label: 'Turn into',
	trailingIcon: 'i-lucide-chevron-down',
	activeColor: 'neutral',
	activeVariant: 'ghost',
	tooltip: { text: 'Turn into' },
	content: { align: 'start' },
	ui: { label: 'text-xs' },
	items: [{
		type: 'label',
		label: 'Turn into',
	}, {
		kind: 'paragraph',
		label: 'Paragraph',
		icon: 'i-lucide-type',
	}, {
		kind: 'heading',
		level: 1,
		icon: 'i-lucide-heading-1',
		label: 'Heading 1',
	}, {
		kind: 'heading',
		level: 2,
		icon: 'i-lucide-heading-2',
		label: 'Heading 2',
	}, {
		kind: 'heading',
		level: 3,
		icon: 'i-lucide-heading-3',
		label: 'Heading 3',
	}, {
		kind: 'heading',
		level: 4,
		icon: 'i-lucide-heading-4',
		label: 'Heading 4',
	}, {
		kind: 'bulletList',
		icon: 'i-lucide-list',
		label: 'Bullet List',
	}, {
		kind: 'orderedList',
		icon: 'i-lucide-list-ordered',
		label: 'Ordered List',
	}, {
		kind: 'blockquote',
		icon: 'i-lucide-text-quote',
		label: 'Blockquote',
	}, {
		kind: 'codeBlock',
		icon: 'i-lucide-square-code',
		label: 'Code Block',
	}],
}], [{
	kind: 'mark',
	mark: 'bold',
	icon: 'i-lucide-bold',
	tooltip: { text: 'Bold' },
}, {
	kind: 'mark',
	mark: 'italic',
	icon: 'i-lucide-italic',
	tooltip: { text: 'Italic' },
}, {
	kind: 'mark',
	mark: 'underline',
	icon: 'i-lucide-underline',
	tooltip: { text: 'Underline' },
}, {
	kind: 'mark',
	mark: 'strike',
	icon: 'i-lucide-strikethrough',
	tooltip: { text: 'Strikethrough' },
}, {
	kind: 'mark',
	mark: 'code',
	icon: 'i-lucide-code',
	tooltip: { text: 'Code' },
}], [{
	slot: 'link' as const,
	icon: 'i-lucide-link',
}, {
	kind: 'imageUpload',
	icon: 'i-lucide-image',
	tooltip: { text: 'Image' },
}, {
	kind: 'fileUpload',
	icon: 'i-lucide-paperclip',
	tooltip: { text: 'File' },
}]] satisfies EditorToolbarItem<typeof customHandlers>[][]);

const imageToolbarItems = (editor: Editor): EditorToolbarItem[][] => {
	const node = editor.state.doc.nodeAt(editor.state.selection.from);

	return [[{
		icon: 'i-lucide-download',
		to: node?.attrs?.src,
		download: true,
		tooltip: { text: 'Download' },
	}, {
		icon: 'i-lucide-refresh-cw',
		tooltip: { text: 'Replace' },
		onClick: () => {
			const { state } = editor;
			const pos = state.selection.from;
			const selectedNode = state.doc.nodeAt(pos);

			if (selectedNode && selectedNode.type.name === 'image') {
				imageReplaceState.value = { pos, nodeSize: selectedNode.nodeSize };
				imageModalOpen.value = true;
			}
		},
	}], [{
		icon: 'i-lucide-trash',
		tooltip: { text: 'Delete' },
		onClick: () => {
			const { state } = editor;
			const pos = state.selection.from;
			const selectedNode = state.doc.nodeAt(pos);

			if (selectedNode && selectedNode.type.name === 'image') {
				editor.chain().focus().deleteRange({ from: pos, to: pos + selectedNode.nodeSize }).run();
			}
		},
	}]];
};

const postFileToolbarItems = (editor: Editor): EditorToolbarItem[][] => [[{
	icon: 'i-lucide-trash',
	tooltip: { text: 'Delete' },
	onClick: () => {
		const { state } = editor;
		const pos = state.selection.from;
		const selectedNode = state.doc.nodeAt(pos);

		if (selectedNode && selectedNode.type.name === 'postFile') {
			editor.chain().focus().deleteRange({ from: pos, to: pos + selectedNode.nodeSize }).run();
		}
	},
}]];

const selectedNode = ref<{ node: JSONContent; pos: number }>();

const handleItems = (editor: Editor): DropdownMenuItem[][] => {
	if (!selectedNode.value?.node?.type) {
		return [];
	}

	return mapEditorItems(editor, [[
		{
			type: 'label',
			label: upperFirst(selectedNode.value.node.type),
		},
		{
			label: 'Turn into',
			icon: 'i-lucide-repeat-2',
			children: [
				{ kind: 'paragraph', label: 'Paragraph', icon: 'i-lucide-type' },
				{ kind: 'heading', level: 1, label: 'Heading 1', icon: 'i-lucide-heading-1' },
				{ kind: 'heading', level: 2, label: 'Heading 2', icon: 'i-lucide-heading-2' },
				{ kind: 'heading', level: 3, label: 'Heading 3', icon: 'i-lucide-heading-3' },
				{ kind: 'heading', level: 4, label: 'Heading 4', icon: 'i-lucide-heading-4' },
				{ kind: 'bulletList', label: 'Bullet List', icon: 'i-lucide-list' },
				{ kind: 'orderedList', label: 'Ordered List', icon: 'i-lucide-list-ordered' },
				{ kind: 'blockquote', label: 'Blockquote', icon: 'i-lucide-text-quote' },
				{ kind: 'codeBlock', label: 'Code Block', icon: 'i-lucide-square-code' },
			],
		},
		{
			kind: 'clearFormatting',
			pos: selectedNode.value?.pos,
			label: 'Reset formatting',
			icon: 'i-lucide-rotate-ccw',
		},
	], [
		{
			kind: 'duplicate',
			pos: selectedNode.value?.pos,
			label: 'Duplicate',
			icon: 'i-lucide-copy',
		},
		{
			label: 'Copy to clipboard',
			icon: 'i-lucide-clipboard',
			onSelect: async () => {
				if (!selectedNode.value) return;

				const pos = selectedNode.value.pos;
				const node = editor.state.doc.nodeAt(pos);
				if (node) {
					await navigator.clipboard.writeText(node.textContent);
				}
			},
		},
	], [
		{
			kind: 'moveUp',
			pos: selectedNode.value?.pos,
			label: 'Move up',
			icon: 'i-lucide-arrow-up',
		},
		{
			kind: 'moveDown',
			pos: selectedNode.value?.pos,
			label: 'Move down',
			icon: 'i-lucide-arrow-down',
		},
	], [
		{
			kind: 'delete',
			pos: selectedNode.value?.pos,
			label: 'Delete',
			icon: 'i-lucide-trash',
		},
	]], customHandlers) as DropdownMenuItem[][];
};

const suggestionItems = [[{
	type: 'label',
	label: 'AI',
}, {
	kind: 'aiContinue',
	label: 'Continue writing',
	icon: 'i-lucide-sparkles',
}], [{
	type: 'label',
	label: 'Style',
}, {
	kind: 'paragraph',
	label: 'Paragraph',
	icon: 'i-lucide-type',
}, {
	kind: 'heading',
	level: 1,
	label: 'Heading 1',
	icon: 'i-lucide-heading-1',
}, {
	kind: 'heading',
	level: 2,
	label: 'Heading 2',
	icon: 'i-lucide-heading-2',
}, {
	kind: 'heading',
	level: 3,
	label: 'Heading 3',
	icon: 'i-lucide-heading-3',
}, {
	kind: 'bulletList',
	label: 'Bullet List',
	icon: 'i-lucide-list',
}, {
	kind: 'orderedList',
	label: 'Numbered List',
	icon: 'i-lucide-list-ordered',
}, {
	kind: 'blockquote',
	label: 'Blockquote',
	icon: 'i-lucide-text-quote',
}, {
	kind: 'codeBlock',
	label: 'Code Block',
	icon: 'i-lucide-square-code',
}], [{
	type: 'label',
	label: 'Insert',
}, {
	kind: 'imageUpload',
	label: 'Image',
	icon: 'i-lucide-image',
}, {
	kind: 'fileUpload',
	label: 'File',
	icon: 'i-lucide-paperclip',
}, {
	kind: 'horizontalRule',
	label: 'Horizontal Rule',
	icon: 'i-lucide-separator-horizontal',
}]] satisfies EditorSuggestionMenuItem<typeof customHandlers>[][];
</script>

<template>
	<PostEditorImageUploadModal
		v-model="imageModalOpen"
		@confirm="onImageConfirm"
	/>

	<PostEditorFileUploadModal
		v-model="fileModalOpen"
		@confirm="onFileConfirm"
	/>

	<UEditor
		ref="editorRef"
		v-slot="{ editor, handlers }"
		v-model="value"
		content-type="markdown"
		:starter-kit="{ codeBlock: false }"
		:extensions="[
			PostFileExtension,
			codeBlockExtension,
			completionExtension,
		]"
		:handlers="customHandlers"
		placeholder="Write, type '/' for commands..."
		:ui="{ base: 'p-8 sm:px-16 py-13.5' }"
		class="w-full"
	>
		<UEditorToolbar
			:editor="editor"
			:items="fixedToolbarItems"
			class="border-b border-muted sticky top-(--ui-header-height) inset-x-0 p-2 z-50 bg-default/75 backdrop-blur overflow-x-auto"
		>
			<template #link>
				<EditorLinkPopover
					:editor="editor"
					auto-open
				/>
			</template>
		</UEditorToolbar>

		<UEditorToolbar
			:editor="editor"
			:items="bubbleToolbarItems"
			layout="bubble"
			:should-show="({ view, state }) => {
				const { selection } = state
				if (selection instanceof NodeSelection) return false
				return view.hasFocus() && !selection.empty
			}"
		>
			<template #link>
				<EditorLinkPopover :editor="editor" />
			</template>
		</UEditorToolbar>

		<UEditorToolbar
			:editor="editor"
			:items="imageToolbarItems(editor)"
			layout="bubble"
			:should-show="({ editor, view }) => {
				return editor.isActive('image') && view.hasFocus()
			}"
		/>

		<UEditorToolbar
			:editor="editor"
			:items="postFileToolbarItems(editor)"
			layout="bubble"
			:should-show="({ view, state }) => {
				const { selection } = state
				return view.hasFocus() && selection instanceof NodeSelection && selection.node.type.name === 'postFile'
			}"
		/>

		<UEditorSuggestionMenu
			:editor="editor"
			:items="suggestionItems"
		/>

		<UEditorDragHandle
			v-slot="{ ui, onClick }"
			:editor="editor"
			@node-change="selectedNode = $event"
		>
			<UButton
				icon="i-lucide-plus"
				color="neutral"
				variant="ghost"
				size="sm"
				:class="ui.handle()"
				@click="(e) => {
					e.stopPropagation()

					const selected = onClick()
					handlers.suggestion?.execute(editor, { pos: selected?.pos }).run()
				}"
			/>

			<UDropdownMenu
				v-slot="{ open }"
				:modal="false"
				:items="handleItems(editor)"
				:content="{ side: 'left' }"
				:ui="{ content: 'w-48', label: 'text-xs' }"
				@update:open="editor.chain().setMeta('lockDragHandle', $event).run()"
			>
				<UButton
					color="neutral"
					variant="ghost"
					active-variant="soft"
					size="sm"
					icon="i-lucide-grip-vertical"
					:active="open"
					:class="ui.handle()"
				/>
			</UDropdownMenu>
		</UEditorDragHandle>
	</UEditor>
</template>

<style>
html.dark .tiptap .shiki,
html.dark .tiptap .shiki span {
  color: var(--shiki-dark) !important;
  background-color: var(--ui-bg-muted) !important;
}
</style>
