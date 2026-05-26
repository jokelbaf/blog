<script setup lang="ts">
import type { NuxtError } from '#app';

const props = defineProps({
	error: Object as () => NuxtError,
});
console.error(props.error);

const { title, message } = {
	401: {
		title: 'Unauthorized',
		message: 'You are not authorized to access this resource.',
	},
	403: {
		title: 'Forbidden',
		message: 'You are not allowed to access this resource.',
	},
	404: {
		title: 'Not Found',
		message: 'The page you are looking for does not exist.',
	},
	422: {
		title: 'Validation Error',
		message: 'There was a validation error with your request.',
	},
}[props.error?.status || 0] || {
	title: 'Something went wrong',
	message: 'Please try again later.',
};
</script>

<template>
	<UError
		:error="{
			status: error?.status,
			statusMessage: title,
			message: error?.message || message,
		}"
	/>
</template>
