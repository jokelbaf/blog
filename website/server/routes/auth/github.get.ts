export default defineOAuthGitHubEventHandler({
	config: {
		emailRequired: true,
	},

	async onSuccess(event, { user }) {
		let dbUser = await prisma.user.findUnique({
			where: { githubId: user.id },
		});

		if (!dbUser) {
			dbUser = await prisma.user.create({
				data: {
					githubId: user.id,
					login: user.login,
					name: user.name,
					email: user.email,
					avatarUrl: user.avatar_url,
					isAdmin: user.login === process.env.ADMIN_GITHUB_LOGIN,
				},
			});
		}

		await setUserSession(event, {
			user: {
				id: dbUser.id,
				login: dbUser.login,
				name: dbUser.name,
				avatarUrl: dbUser.avatarUrl,
				isAdmin: dbUser.isAdmin,
			},
		});

		return sendRedirect(event, '/login/callback');
	},

	onError(event, error) {
		console.error('GitHub OAuth error:', error);

		return sendRedirect(event, '/login/callback?error=oauth_failed');
	},
});
