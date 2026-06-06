import { pino } from 'pino';
import type { H3Event } from 'h3';

const isProduction = process.env.NODE_ENV === 'production';

export const logger = pino({
	level: process.env.LOG_LEVEL ?? (isProduction ? 'info' : 'debug'),
	transport: isProduction
		? undefined
		: {
				target: 'pino-pretty',
				options: {
					colorize: true,
					translateTime: 'SYS:HH:MM:ss.l',
					ignore: 'pid,hostname',
				},
			},
});

export function createRequestLogger(event: H3Event) {
	return logger.child({
		requestId: event.context.requestId,
		method: event.method,
		path: event.path,
	});
}
