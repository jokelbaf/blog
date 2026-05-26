import * as z from 'zod';

export const commentCreateSchema = z.object({
	content: z.string().min(1).max(256),
});

export const commentIdParamSchema = z.object({
	id: z.coerce.number().int().positive(),
});
