<script setup lang="ts">
const { data: releases, error } = await useFetch('/api/changelog');

if (error.value) {
	throw createError({
		statusCode: error.value.statusCode || 500,
		message: error.value.data?.message || 'Failed to fetch releases',
		fatal: true,
	});
}
</script>

<template>
	<UContainer class="py-8">
		<div class="mx-auto max-w-2xl">
			<h1 class="text-3xl font-bold mb-4">
				Changelog
			</h1>
			<p class="text-muted">
				See what's new in each release. The summary is generated automatically from my GitHub commits using the
				<NuxtLink
					to="https://github.com/jokelbaf/pnpm-release"
					class="text-primary underline"
					target="_blank"
				>pnpm-release</NuxtLink> action, then fetched via GitHub API.
			</p>
			<USeparator class="my-6 sm:my-8" />
		</div>
		<UChangelogVersions>
			<UChangelogVersion
				v-for="(release, index) in releases"
				:key="index"
				:date="release.date"
			>
				<template #body>
					<div class="changelog-body">
						<MDC :value="release.body" />
					</div>
				</template>
			</UChangelogVersion>
		</UChangelogVersions>
		<p class="text-center text-sm text-muted mt-8 lg:mt-16">
			You've reached the beginning of the story...
		</p>
	</UContainer>
</template>

<style scoped>
.changelog-body :deep(hr) {
	margin-top: 1rem;
	margin-bottom: 1rem;
}
.changelog-body :deep(h2) {
	margin-top: 2rem;
}
</style>
