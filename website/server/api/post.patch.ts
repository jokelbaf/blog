import { postUpdateSchema } from '../schemas/post';
import type { File } from '~~/prisma/generated/client';

export default defineEventHandler(async (event) => {
	const session = await requireUserSession(event);
	if (!session.user.isAdmin)
		throw createError({
			statusCode: 403,
			message: 'You do not have enough permissions to access this resource',
		});

	const result = await readValidatedBody(event, b => postUpdateSchema.safeParse(b));

	if (!result.success)
		throwValidationError(result);

	const { id, title, description, thumbnail, content, isDraft } = result.data;

	const dbPost = await prisma.post.findUnique({
		where: { id },
		include: { thumbnail: true },
	});

	if (!dbPost)
		throw createError({ statusCode: 404, message: 'The post you are looking for does not exist.' });

	let newThumbnail: File | undefined = undefined;

	if (thumbnail) {
		newThumbnail = await prisma.file.create({
			data: {
				name: thumbnail.name,
				ext: thumbnail.ext,
				size: thumbnail.size,
				author: {
					connect: { id: session.user.id },
				},
			},
		});

		await storeFileLocally({
			...thumbnail,
			size: thumbnail.size.toString(),
			lastModified: thumbnail.lastModified.toString(),
		}, newThumbnail.uid);
	}

	let newSlug: string | undefined = undefined;

	if (title) {
		newSlug = postTitleToSlug(title);
		const dbSlug = await prisma.post.findUnique({
			where: { slug: newSlug, NOT: { id } },
			select: { slug: true },
		});

		if (dbSlug)
			throw createError({ statusCode: 400, message: 'A post with the same title already exists' });
	}

	const readTimeSec = content ? estimateReadTime(content) : undefined;

	try {
		const post = await prisma.post.update({
			where: { id },
			data: {
				title,
				description,
				slug: newSlug,
				content,
				readTimeSec,
				isDraft,
				thumbnail: newThumbnail && { connect: { uid: newThumbnail.uid } },
			},
			include: {
				thumbnail: true,
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

		if (thumbnail && dbPost.thumbnail) {
			await prisma.file.delete({ where: { uid: dbPost.thumbnail.uid } });
			await deleteFile(`${dbPost.thumbnail.uid}.${dbPost.thumbnail.ext}`);
		}

		return post;
	} catch (e) {
		if (newThumbnail) {
			await prisma.file.delete({ where: { uid: newThumbnail.uid } }).catch(() => {});
			await deleteFile(`${newThumbnail.uid}.${newThumbnail.ext}`).catch(() => {});
		}
		throw e;
	}
});
