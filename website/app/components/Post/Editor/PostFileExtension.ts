import { Node, mergeAttributes } from '@tiptap/core';
import type { NodeViewRenderer } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-3';

import PostFileNodeComponent from './PostFileNode.vue';

declare module '@tiptap/core' {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
	interface NodeConfig<Options = any, Storage = any> {
		markdownTokenName?: string;
		markdownTokenizer?: {
			name: string;
			level?: 'block' | 'inline';
			start?: string | ((src: string) => number);
			tokenize: (src: string, tokens?: unknown[], helpers?: unknown) => Record<string, unknown> | undefined;
		};
		parseMarkdown?: (token: Record<string, unknown>, helpers?: unknown) => unknown;
		renderMarkdown?: (node: unknown, helpers?: unknown, context?: unknown) => string;
	}
}

const ATTR_REGEX = (key: string) => new RegExp(`${key}="([^"]*)"`);

export const PostFileExtension = Node.create({
	name: 'postFile',
	group: 'block',
	atom: true,
	draggable: true,

	addAttributes() {
		return {
			name: { default: '' },
			size: { default: '' },
			url: { default: '' },
		};
	},

	parseHTML() {
		return [{ tag: 'div[data-type="post-file"]' }];
	},

	renderHTML({ HTMLAttributes, node }) {
		return ['div', mergeAttributes(HTMLAttributes, {
			'data-type': 'post-file',
			'data-name': node.attrs.name,
			'data-size': node.attrs.size,
			'data-url': node.attrs.url,
		})];
	},

	addNodeView(): NodeViewRenderer {
		return VueNodeViewRenderer(PostFileNodeComponent);
	},

	renderMarkdown(node: unknown): string {
		const { name, size, url } = (node as { attrs: Record<string, string> }).attrs;
		return `::PostFile{name="${name}" size="${size}" url="${url}"}\n::`;
	},

	markdownTokenName: 'postFile',

	markdownTokenizer: {
		name: 'postFile',
		level: 'block',
		start: '::PostFile{',
		tokenize(src: string): Record<string, unknown> | undefined {
			const match = /^::PostFile\{([^}]*)\}(?:\n::)?/.exec(src);
			if (!match) return undefined;

			const attrs = match[1]!;
			return {
				type: 'postFile',
				raw: match[0],
				name: ATTR_REGEX('name').exec(attrs)?.[1] ?? '',
				size: ATTR_REGEX('size').exec(attrs)?.[1] ?? '',
				url: ATTR_REGEX('url').exec(attrs)?.[1] ?? '',
			};
		},
	},

	parseMarkdown(token: Record<string, unknown>): Record<string, unknown> {
		return {
			type: 'postFile',
			attrs: {
				name: token['name'] ?? '',
				size: token['size'] ?? '',
				url: token['url'] ?? '',
			},
		};
	},
});
