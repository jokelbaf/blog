/**
 * Converts a post title to a URL-friendly slug.
 *
 * @param title The title of the post to convert.
 * @returns A slug generated from the title.
 */
export function postTitleToSlug(title: string): string {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/**
 * Estimates the reading time of a post based on its content.
 *
 * @param content The content of the post.
 * @returns The estimated reading time in seconds.
 */
export function estimateReadTime(content: string): number {
	const wordsPerMinute = 200;
	const plain = content
		// Block-level MDC components: ::component-name ... :: or :::component-name ... :::
		.replace(/:{2,}[\w-]+(?:\{[^}]*\})?[^\n]*\n[\s\S]*?:{2,}/g, '')
		// Inline MDC components: :component-name{...} or :component-name[...]
		.replace(/:[\w-]+(?:\{[^}]*\}|\[[^\]]*\])*/g, '')
		// Fenced code blocks
		.replace(/`{3}[\s\S]*?`{3}/g, '')
		// Inline code
		.replace(/`[^`]+`/g, '')
		// Images and links, keep only label text
		.replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
		// Markdown headings, bold, italic, strikethrough
		.replace(/#{1,6}\s+/g, '')
		.replace(/(\*{1,3}|_{1,3}|~~)(.*?)\1/g, '$2')
		// Frontmatter
		.replace(/^---[\s\S]*?---/m, '');

	const words = plain.trim().split(/\s+/).filter(Boolean).length;
	return Math.ceil((words / wordsPerMinute) * 60);
}
