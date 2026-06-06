import { postsQuerySchema } from '../schemas/post';

export default defineEventHandler(async (event) => {
	const result = await getValidatedQuery(event, q => postsQuerySchema.safeParse(q));

	if (!result.success)
		throwValidationError(result);

	const { search, orderBy = 'createdAt', orderDir = 'desc' } = result.data;

	const posts = await prisma.post.findMany({
		where: search
			? {
					OR: [
						{ title: { contains: search, mode: 'insensitive' } },
						{ description: { contains: search, mode: 'insensitive' } },
						{ content: { contains: search, mode: 'insensitive' } },
					],
				}
			: undefined,
		orderBy: {
			[orderBy]: orderDir,
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
