import * as z from 'zod';

export const completionSchema = z.object({
	prompt: z.string().min(1),
	mode: z.enum([
		'fix',
		'extend',
		'reduce',
		'simplify',
		'summarize',
		'continue',
	]).default('continue'),
});
