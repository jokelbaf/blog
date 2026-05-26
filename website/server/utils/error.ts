import type { ZodSafeParseError } from 'zod';

/**
 * Throws an H3Error with status 422 derived from a failed Zod SafeParseResult.
 *
 * @param result The ZodSafeParseError containing validation issues.
 * @throws An H3Error with status 422 and a message from the first validation issue.
 */
export function throwValidationError(result: ZodSafeParseError<unknown>): never {
	throw createError({
		status: 422,
		statusMessage: result.error.issues[0]?.message ?? 'Invalid request',
	});
}
