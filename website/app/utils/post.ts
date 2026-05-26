/**
 * Get url for the File object.
 *
 * @param uid The uid of the file.
 * @param ext The extension of the file.
 * @returns Direct url to the file.
 */
export function getFileUrl(uid: string, ext: string) {
	return `/file/${uid}.${ext}`;
}

/**
 * Parse a date string into a Date object.
 *
 * @param date The date string.
 * @returns The parsed Date object.
 */
export function parsePostDate(date: string): Date {
	return new Date(date);
}

/**
 * Format a serialized post date into a human-readable string.
 *
 * @param date The serialized date string.
 * @returns The formatted date string (e.g. "January 1, 2024").
 */
export function formatPostDate(date: string): string {
	return new Intl.DateTimeFormat('en', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		timeZone: 'UTC',
	}).format(new Date(date));
}

/**
 * Get the read time in minutes.
 *
 * @param sec The number of seconds.
 * @returns The read time in minutes.
 */
export function getReadTimeMin(sec: number): number {
	return Math.max(1, Math.ceil(sec / 60));
}

/**
 * Get url to the post page.
 *
 * @param slug Slug of the post.
 * @returns The url to the post page.
 */
export function getPostUrl(slug: string) {
	return `/post/${slug}`;
}

/**
 * Format a file size in bytes to a human-readable string.
 *
 * @param bytes The size in bytes.
 * @returns Formatted size string (e.g. "1.5 MB").
 */
export function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
