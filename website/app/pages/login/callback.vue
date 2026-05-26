<script setup lang="ts">
const route = useRoute();

definePageMeta({
	layout: 'blank',
});

const errorKey = route.query.error?.toString();

const errorMsgMap: { [key: string]: string } = {
	oauth_failed: 'OAuth authentication failed.',
};

const errorMsg = errorKey ? errorMsgMap[errorKey] : null;
const hasError = !!errorMsg;
</script>

<template>
	<div class="h-screen flex flex-col items-center justify-center">
		<template v-if="hasError">
			<UIcon
				name="lucide:circle-alert"
				class="size-15 text-error"
			/>
			<h1 class="text-2xl font-bold mt-4">
				Login Error
			</h1>
			<p class="text-muted mt-2">
				{{ errorMsg }}
			</p>
		</template>
		<template v-else>
			<UIcon
				name="lucide:circle-check-big"
				class="size-15 text-primary"
			/>
			<h1 class="text-2xl font-bold mt-4">
				Login Successful
			</h1>
			<p class="text-muted mt-2">
				You may now close this page.
			</p>
		</template>
	</div>
</template>
