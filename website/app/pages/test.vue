<script setup lang="ts">
import { usePostFileUpload } from '../composables/usePostFileUpload';

const { handleFileInput, files } = useFileStorage({ clearOldFiles: false });
const { error, upload, uploading } = usePostFileUpload();
</script>

<template>
	<div>
		<p v-if="uploading">
			Uploading...
		</p>
		<p v-if="error">
			{{ error }}
		</p>
		<input
			type="file"
			@input="handleFileInput"
		>
		<button @click="() => upload(files)">
			submit
		</button>
	</div>
</template>
