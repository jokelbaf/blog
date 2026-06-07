<script setup lang="ts">
defineProps<{
	date: string;
}>();

const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' });
const formatDate = (isoString: string) => dateFormatter.format(new Date(isoString));
</script>

<template>
	<UChangelogVersion :date="date">
		<template #date>
			{{ formatDate(date) }}
		</template>
		<template #body>
			<slot name="body" />
		</template>
	</UChangelogVersion>
</template>
