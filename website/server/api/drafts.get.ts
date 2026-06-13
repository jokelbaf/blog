import { draftsQuerySchema } from '../schemas/post';

export default defineEventHandler(async (event) => {
	await requireUserSession(event);

	const result = await getValidatedQuery(event, q => draftsQuerySchema.safeParse(q));

	if (!result.success)
		throwValidationError(result);

	const { search } = result.data;

	const posts = await prisma.post.findMany({
		where: {
			isDraft: true,
			...(
				search
					? {
							OR: [
								{ title: { contains: search, mode: 'insensitive' } },
								{ description: { contains: search, mode: 'insensitive' } },
							],
						}
					: undefined),
		},
		include: {
			thumbnail: {
				omit: {
					updatedAt: true,
					createdAt: true,
					authorId: true,
				},
			},
		},
		omit: { content: true },
	});

	return posts;
});
