import { postCreateSchema } from '../schemas/post';
import type { File } from '~~/prisma/generated/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

export default defineEventHandler(async (event) => {
	const session = await requireUserSession(event);
	if (!session.user.isAdmin)
		throw createError({
			statusCode: 403,
			message: 'You do not have enough permissions to access this resource',
		});

	const result = await readValidatedBody(event, b => postCreateSchema.safeParse(b));

	if (!result.success)
		throwValidationError(result);

	const { title, description, thumbnail, content } = result.data;

	let dbThumbnail: File | undefined = undefined;

	if (thumbnail) {
		dbThumbnail = await prisma.file.create({
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
		}, dbThumbnail.uid);
	}

	const slug = postTitleToSlug(title);
	const readTimeSec = estimateReadTime(content);

	try {
		const post = await prisma.post.create({
			data: {
				title,
				description,
				slug,
				content,
				readTimeSec,
				author: { connect: { id: session.user.id } },
				thumbnail: dbThumbnail && { connect: { uid: dbThumbnail.uid } },
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

		return post;
	} catch (e) {
		if (dbThumbnail) {
			await prisma.file.delete({ where: { uid: dbThumbnail.uid } }).catch(() => {});
			await deleteFile(`${dbThumbnail.uid}.${dbThumbnail.ext}`).catch(() => {});
		}

		const isSlugConflict = e instanceof PrismaClientKnownRequestError
			&& e.code === 'P2002'
			&& (e.meta?.target as string[] | undefined)?.includes('slug');

		if (isSlugConflict)
			throw createError({ statusCode: 400, message: 'A post with the same title already exists' });

		throw e;
	}
});
