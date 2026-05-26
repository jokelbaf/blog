<script setup lang="ts">
import type { ClientFile } from 'nuxt-file-storage';

const open = defineModel<boolean>({ required: true });

const emit = defineEmits<{
	confirm: [name: string, size: number, url: string];
}>();

const selectedFile = ref<File | null>(null);
const filePreviewUrl = ref<string | null>(null);
const { upload, uploading, error } = usePostFileUpload();

watch(selectedFile, (newFile) => {
	if (filePreviewUrl.value) {
		URL.revokeObjectURL(filePreviewUrl.value);
		filePreviewUrl.value = null;
	}
	if (newFile) {
		filePreviewUrl.value = URL.createObjectURL(newFile);
	}
});

watch(open, (isOpen) => {
	if (!isOpen) {
		selectedFile.value = null;
		error.value = null;
		if (filePreviewUrl.value) {
			URL.revokeObjectURL(filePreviewUrl.value);
			filePreviewUrl.value = null;
		}
	}
});

async function readAsDataUrl(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = e => resolve(e.target!.result as string);
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
}

async function handleConfirm() {
	if (!selectedFile.value) return;

	const file = selectedFile.value;
	const content = await readAsDataUrl(file);
	const clientFile = {
		name: file.name,
		content,
		size: file.size,
		type: file.type,
		lastModified: file.lastModified,
	} as unknown as ClientFile;

	const response = await upload([clientFile]) as { uid: string; ext: string } | undefined;
	if (!response) return;

	emit('confirm', file.name, file.size, getFileUrl(response.uid, response.ext));
	open.value = false;
}
</script>

<template>
	<UModal
		v-model:open="open"
		title="Upload File"
		:ui="{ footer: 'justify-end' }"
	>
		<template #body>
			<div class="space-y-4">
				<UFileUpload
					v-model="selectedFile"
					label="Choose a file"
					description="Any file type"
					:preview="false"
				>
					<template #leading>
						<UAvatar
							:icon="uploading ? 'i-lucide-loader-circle' : 'i-lucide-paperclip'"
							size="xl"
							:ui="{ icon: uploading ? ['animate-spin'] : [] }"
						/>
					</template>
				</UFileUpload>

				<div
					v-if="selectedFile"
					class="space-y-1.5"
				>
					<p class="text-xs text-muted font-medium uppercase tracking-wide">
						Preview
					</p>
					<PostFile
						:name="selectedFile.name"
						:size="formatFileSize(selectedFile.size)"
						:url="filePreviewUrl ?? '#'"
					/>
				</div>

				<p
					v-if="error"
					class="text-sm text-error"
				>
					{{ error }}
				</p>
			</div>
		</template>

		<template #footer>
			<UButton
				color="neutral"
				variant="ghost"
				label="Cancel"
				@click="open = false"
			/>
			<UButton
				label="Upload & Insert"
				:disabled="!selectedFile || uploading"
				:loading="uploading"
				@click="handleConfirm"
			/>
		</template>
	</UModal>
</template>
