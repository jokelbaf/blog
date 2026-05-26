import { postSlugParamSchema } from '../../schemas/post';

export default defineEventHandler(async (event) => {
	const result = await getValidatedRouterParams(event, p => postSlugParamSchema.safeParse(p));

	if (!result.success)
		throwValidationError(result);

	const post = await prisma.post.findUnique({
		where: { slug: result.data.slug },
		include: {
			thumbnail: {
				omit: {
					updatedAt: true,
					createdAt: true,
					authorId: true,
				},
			},
			author: {
				omit: {
					email: true,
					githubId: true,
					isAdmin: true,
					createdAt: true,
					updatedAt: true,
				},
			},
			comments: {
				omit: {
					postId: true,
					updatedAt: true,
					authorId: true,
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
			},
		},
	});

	if (!post)
		throw createError({ status: 404, message: 'The post you are looking for does not exist.' });

	// const post: PostDetail = {
	// 	id: 1,
	// 	authorId: 1,
	// 	title: 'Reversing Strinova Network Protocol',
	// 	description: 'My experience with reversing Strinova game network protocol.',
	// 	slug: 'reversing-strinova-network-protocol',
	// 	content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
	// 	readTimeSec: 120,
	// 	views: 54,
	// 	createdAt: new Date('2025-03-10'),
	// 	updatedAt: new Date('2025-03-10'),
	// 	thumbnailUid: 'eb70e8b6-62dc-498f-bd12-886a58a74b2b',
	// 	thumbnail: {
	// 		uid: 'eb70e8b6-62dc-498f-bd12-886a58a74b2b',
	// 		name: 'strinova-thumbnail',
	// 		ext: 'jpg',
	// 		size: 123,
	// 	},
	// 	author: {
	// 		id: 1,
	// 		login: 'jokelbaf',
	// 		name: 'JokelBaf',
	// 		avatarUrl: 'https://avatars.githubusercontent.com/u/60827680?v=4',
	// 	},
	// };

	return post;
});
