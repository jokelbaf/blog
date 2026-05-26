import * as z from 'zod';

export const fileNameSchema = z
	.string()
	.min(1)
	.transform((value, ctx) => {
		const match = /^(.+)\.([a-zA-Z0-9]+)$/.exec(value);

		if (!match) {
			ctx.addIssue({
				code: 'custom',
				message: 'Invalid file name format',
			});
			return z.NEVER;
		}

		const name = match[1]!;
		const ext = match[2]!;

		return { name, ext };
	});

export const fileNameParamSchema = z.object({
	name: fileNameSchema,
});

export const serverFileSchema = z
	.object({
		name: z.string().min(1),
		content: z.string(),
		size: z.number().nonnegative(),
		type: z.string().min(1),
		lastModified: z.number().int().nonnegative(),
	})
	.transform((val, ctx) => {
		const parsed = fileNameSchema.safeParse(val.name);

		if (!parsed.success) {
			ctx.addIssue({ code: 'custom', message: parsed.error.message });
			return z.NEVER;
		}

		const mimeExt = val.type.split('/')[1]?.replace(/[^a-zA-Z0-9]/g, '');
		const ext = mimeExt || parsed.data.ext;

		return { ...val, name: parsed.data.name, ext };
	});

export const fileUploadSchema = z.object({
	file: serverFileSchema,
});
