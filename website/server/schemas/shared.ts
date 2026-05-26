import type * as z from 'zod';

export function atLeastOneDefined<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
	return schema.refine(
		data => Object.values(data).some(v => v !== undefined),
		{ message: 'At least one field must be provided' },
	);
}
