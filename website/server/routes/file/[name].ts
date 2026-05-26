import { fileNameParamSchema } from '../../schemas/file';

export default defineEventHandler(async (event) => {
	const result = await getValidatedRouterParams(event, p => fileNameParamSchema.safeParse(p));

	if (!result.success)
		throwValidationError(result);

	const { name, ext } = result.data.name;

	const file = await prisma.file.findUnique({
		where: { uid: name },
	});

	if (!file)
		throw createError({
			status: 404,
			statusText: 'The file you are looking for does not exist.',
		});

	return await retrieveFileLocally(event, `${name}.${ext}`);
});
