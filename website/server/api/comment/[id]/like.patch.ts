import { commentIdParamSchema } from '../../../schemas/comment';

export default defineEventHandler(async (event) => {
	const session = await requireUserSession(event);

	const bodyResult = await getValidatedRouterParams(event, p => commentIdParamSchema.safeParse(p));

	if (!bodyResult.success)
		throwValidationError(bodyResult);

	const { id } = bodyResult.data;

	const comment = await prisma.comment.findUnique({
		where: { id },
		include: { post: true },
	});

	if (!comment)
		throw createError({
			statusCode: 404,
			message: 'Could not find the comment you are looking for.',
		});

	if (session.user.id !== comment.post.authorId)
		throw createError({
			statusCode: 403,
			message: 'You do not have enough permissions to access this resource',
		});

	return await prisma.comment.update({
		where: { id },
		data: {
			likedByAuthor: !comment.likedByAuthor,
		},
	});
});
