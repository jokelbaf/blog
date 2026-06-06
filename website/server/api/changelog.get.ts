type GitHubRelease = {
	id: number;
	tag_name: string;
	name: string;
	body: string;
	published_at: string;
	html_url: string;
};

export default defineCachedEventHandler(async () => {
	const config = useRuntimeConfig();

	const releases = await $fetch<GitHubRelease[]>(
		`https://api.github.com/repos/${config.githubOwner}/${config.githubRepo}/releases`,
		{
			headers: {
				Authorization: `Bearer ${config.githubToken}`,
			},
		},
	);

	return releases.map(r => ({
		body: r.body,
		date: r.published_at,
	}));
}, {
	maxAge: 60 * 60, // 1 hour
});
