import type { ClientFile } from 'nuxt-file-storage';

export const usePostFileUpload = () => {
	const uploading = ref(false);
	const error = ref<string | null>(null);

	const upload = async (files: ClientFile[] = []) => {
		const file = files[0];
		if (!file) return;

		uploading.value = true;
		error.value = null;

		try {
			const response = await $fetch('/api/file', {
				method: 'POST',
				body: { file },
			});
			return response;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (e: any) {
			error.value = e?.data?.message || 'Upload failed';
			throw e;
		} finally {
			uploading.value = false;
		}
	};

	return {
		upload,
		uploading,
		error,
	};
};
