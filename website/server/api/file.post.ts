import { fileUploadSchema } from '../schemas/file';

export default defineEventHandler(async (event) => {
	const session = await requireUserSession(event);
	if (!session.user.isAdmin)
		throw createError({
			statusCode: 403,
			message: 'You do not have enough permissions to access this resource',
		});

	const uploadResult = await readValidatedBody(event, b => fileUploadSchema.safeParse(b));

	if (!uploadResult.success)
		throwValidationError(uploadResult);

	const { file } = uploadResult.data;

	const dbFile = await prisma.file.create({
		data: {
			name: file.name,
			ext: file.ext,
			size: file.size,
			author: {
				connect: { id: session.user.id },
			},
		},
	});

	await storeFileLocally({
		...file,
		size: file.size.toString(),
		lastModified: file.lastModified.toString(),
	}, dbFile.uid);

	return dbFile;
});
