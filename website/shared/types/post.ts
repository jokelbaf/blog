import type { Prisma } from '../../prisma/generated/client';

export type Post = Omit<Prisma.PostGetPayload<{
	include: {
		thumbnail: {
			omit: {
				updatedAt: true;
				createdAt: true;
				authorId: true;
			};
		};
	};
}>, 'content'>;

export type PostDetail = Prisma.PostGetPayload<{
	include: {
		thumbnail: {
			omit: {
				updatedAt: true;
				createdAt: true;
				authorId: true;
			};
		};
		author: {
			omit: {
				email: true;
				githubId: true;
				isAdmin: true;
				createdAt: true;
				updatedAt: true;
			};
		};
		comments: {
			omit: {
				postId: true;
				updatedAt: true;
				authorId: true;
			};
			include: {
				author: {
					omit: {
						email: true;
						githubId: true;
						isAdmin: true;
						createdAt: true;
						updatedAt: true;
					};
				};
			};
		};
	};
}>;

export type PostComment = Prisma.CommentGetPayload<{
	omit: {
		postId: true;
		updatedAt: true;
		authorId: true;
	};
	include: {
		author: {
			omit: {
				email: true;
				githubId: true;
				isAdmin: true;
				createdAt: true;
				updatedAt: true;
			};
		};
	};
}>;
