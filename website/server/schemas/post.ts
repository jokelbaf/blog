import * as z from 'zod';

import { atLeastOneDefined } from './shared';
import { serverFileSchema } from './file';

export const postCreateSchema = z.object({
	title: z.string().min(1).max(64),
	description: z.string().min(1).max(256),
	thumbnail: serverFileSchema.optional(),
	content: z.string().min(1).max(102_400),
});

export const postUpdateSchema = atLeastOneDefined(postCreateSchema.partial()).and(
	z.object({ id: z.number().int().positive() }),
);

export const postSlugParamSchema = z.object({
	slug: z.string().min(1).max(64),
});

export const postsQuerySchema = z.object({
	search: z.string().max(64).optional(),
	orderBy: z.enum(['createdAt', 'title']).optional(),
	orderDir: z.enum(['asc', 'desc']).optional(),
});
