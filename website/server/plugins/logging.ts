import { randomUUID } from 'node:crypto';

export default defineNitroPlugin((nitroApp) => {
	nitroApp.hooks.hook('request', (event) => {
		event.context.requestId = randomUUID();
		event.context.requestStart = performance.now();

		setResponseHeader(event, 'x-request-id', event.context.requestId);
	});

	nitroApp.hooks.hook('afterResponse', (event) => {
		const log = createRequestLogger(event);
		const durationMs = Math.round(performance.now() - event.context.requestStart);

		log.info({
			statusCode: getResponseStatus(event),
			durationMs,
		}, 'Request completed');
	});

	nitroApp.hooks.hook('error', (error, { event }) => {
		if (!event)
			return;

		const log = createRequestLogger(event);

		log.error({ err: error }, 'Request failed');
	});
});
