<script setup lang="ts">
import type { ClientFile } from 'nuxt-file-storage';

const open = defineModel<boolean>({ required: true });

const emit = defineEmits<{
	confirm: [src: string, alt: string];
}>();

const tabs = [
	{ label: 'URL', slot: 'url', value: 'url' },
	{ label: 'File Upload', slot: 'file', value: 'file' },
];

const activeTab = ref<string>('url');
const url = ref('');
const alt = ref('');
const selectedFile = ref<File | null>(null);
const imagePreviewUrl = ref<string | null>(null);
const imageUrlError = ref(false);
const { upload, uploading, error } = usePostFileUpload();

const canConfirm = computed(() => {
	if (activeTab.value === 'url') return url.value.trim().length > 0;
	return selectedFile.value !== null && !uploading.value;
});

watch(selectedFile, (newFile) => {
	if (imagePreviewUrl.value) {
		URL.revokeObjectURL(imagePreviewUrl.value);
		imagePreviewUrl.value = null;
	}
	if (newFile) {
		imagePreviewUrl.value = URL.createObjectURL(newFile);
	}
});

watch(url, () => {
	imageUrlError.value = false;
});

watch(open, (isOpen) => {
	if (!isOpen) {
		url.value = '';
		alt.value = '';
		selectedFile.value = null;
		activeTab.value = 'url';
		imageUrlError.value = false;
		error.value = null;
		if (imagePreviewUrl.value) {
			URL.revokeObjectURL(imagePreviewUrl.value);
			imagePreviewUrl.value = null;
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
	if (activeTab.value === 'url') {
		const trimmed = url.value.trim();
		if (!trimmed) return;
		emit('confirm', trimmed, alt.value);
		open.value = false;
		return;
	}

	if (!selectedFile.value) return;

	const content = await readAsDataUrl(selectedFile.value);
	const clientFile = {
		name: selectedFile.value.name,
		content,
		size: selectedFile.value.size,
		type: selectedFile.value.type,
		lastModified: selectedFile.value.lastModified,
	} as unknown as ClientFile;

	const response = await upload([clientFile]) as { uid: string; ext: string } | undefined;
	if (!response) return;

	emit('confirm', getFileUrl(response.uid, response.ext), alt.value);
	open.value = false;
}
</script>

<template>
	<UModal
		v-model:open="open"
		title="Insert Image"
		:ui="{ footer: 'justify-end' }"
	>
		<template #body>
			<div class="space-y-4">
				<UTabs
					v-model="activeTab"
					:items="tabs"
					class="w-full"
				>
					<template #url>
						<div class="space-y-3 pt-4">
							<UFormField label="Image URL">
								<UInput
									v-model="url"
									placeholder="https://example.com/image.jpg"
									type="url"
									class="w-full"
									autofocus
								/>
							</UFormField>

							<div
								v-if="url.trim() && !imageUrlError"
								class="rounded-lg overflow-hidden border border-default bg-muted"
							>
								<img
									:src="url"
									alt="Preview"
									class="w-full max-h-48 object-contain"
									@error="imageUrlError = true"
								>
							</div>
						</div>
					</template>

					<template #file>
						<div class="space-y-3 pt-4">
							<UFileUpload
								v-model="selectedFile"
								accept="image/*"
								label="Upload an image"
								description="PNG, JPG, GIF or WebP"
								:preview="false"
							>
								<template #leading>
									<UAvatar
										:icon="uploading ? 'i-lucide-loader-circle' : 'i-lucide-image'"
										size="xl"
										:ui="{ icon: uploading ? ['animate-spin'] : [] }"
									/>
								</template>
							</UFileUpload>

							<div
								v-if="imagePreviewUrl"
								class="rounded-lg overflow-hidden border border-default bg-muted"
							>
								<img
									:src="imagePreviewUrl"
									alt="Preview"
									class="w-full max-h-48 object-contain"
								>
							</div>
						</div>
					</template>
				</UTabs>

				<UFormField label="Alt text">
					<UInput
						v-model="alt"
						placeholder="Describe the image (optional)"
						class="w-full"
					/>
				</UFormField>

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
				label="Insert"
				:disabled="!canConfirm"
				:loading="uploading"
				@click="handleConfirm"
			/>
		</template>
	</UModal>
</template>
