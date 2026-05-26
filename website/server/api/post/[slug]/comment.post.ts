import { commentCreateSchema } from '../../../schemas/comment';
import { postSlugParamSchema } from '../../../schemas/post';

export default defineEventHandler(async (event) => {
	const session = await requireUserSession(event);

	const bodyResult = await readValidatedBody(event, b => commentCreateSchema.safeParse(b));

	if (!bodyResult.success)
		throwValidationError(bodyResult);

	const { content } = bodyResult.data;

	const paramsResult = await getValidatedRouterParams(event, p => postSlugParamSchema.safeParse(p));

	if (!paramsResult.success)
		throwValidationError(paramsResult);

	const { slug } = paramsResult.data;

	const dbPost = await prisma.post.findUnique({
		where: { slug },
	});

	if (!dbPost)
		throw createError({ statusCode: 404, message: 'Couldn\'t find the post to leave a comment on.' });

	const comment = await prisma.comment.create({
		data: {
			content,
			author: { connect: { id: session.user.id } },
			post: { connect: { slug } },
		},
		omit: {
			postId: true,
			authorId: true,
			updatedAt: true,
		},
		include: {
			author: {
				omit: {
					email: true,
					githubId: true,
					isAdmin: true,
					createdAt: true,
					updatedAt: true,
				},
			},
		},
	});

	return comment;
});
