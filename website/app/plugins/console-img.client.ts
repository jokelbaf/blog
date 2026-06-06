import { logImage } from '~/utils/wasm';
import { runWhenIdle } from '~/utils/idle';

export default defineNuxtPlugin((nuxtApp) => {
	nuxtApp.hook('app:mounted', () => {
		runWhenIdle(() => {
			void logImage().catch(() => {});
		});
	});
});
