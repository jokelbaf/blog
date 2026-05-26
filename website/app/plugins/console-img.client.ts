import { logImage } from '~/utils/wasm';

export default defineNuxtPlugin(async () => {
	await logImage();
});
