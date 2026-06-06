/**
 * Runs a callback when the browser is idle or after a timeout, whichever comes first.
 *
 * @param callback The function to run when the browser is idle.
 * @param timeout The maximum time to wait before running the callback, in milliseconds. Default is 3000ms.
 */
export function runWhenIdle(
	callback: () => void,
	timeout = 3000,
) {
	if (import.meta.client && 'requestIdleCallback' in window) {
		requestIdleCallback(callback, { timeout });
	} else {
		setTimeout(callback, 0);
	}
}
