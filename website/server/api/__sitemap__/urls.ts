import { asSitemapUrl, defineSitemapEventHandler } from '#imports';

export default defineSitemapEventHandler(async () => {
	const posts = await prisma.post.findMany({
		select: { slug: true, updatedAt: true },
	});

	return posts.map(post =>
		asSitemapUrl({
			loc: `/post/${post.slug}`,
			lastmod: post.updatedAt,
		}),
	);
});
