import type {
	DecodedImage,
	DecodeError,
} from '../workers/console-img.worker';

interface DecodedPixels {
	pixels: Uint8ClampedArray<ArrayBuffer>;
	width: number;
	height: number;
}

function decodeInWorker(): Promise<DecodedPixels> {
	return new Promise((resolve, reject) => {
		const worker = new Worker(
			new URL('../workers/console-img.worker.ts', import.meta.url),
			{ type: 'module' },
		);

		const cleanup = () => worker.terminate();

		worker.onmessage = (
			event: MessageEvent<DecodedImage | DecodeError>,
		) => {
			cleanup();

			const data = event.data;

			if (!data.ok) {
				reject(new Error(data.error));
				return;
			}

			resolve({
				pixels: new Uint8ClampedArray(data.buffer),
				width: data.width,
				height: data.height,
			});
		};

		worker.onerror = (event) => {
			cleanup();
			reject(
				event.error ?? new Error('wasm worker failed'),
			);
		};
	});
}

/**
 * Log the easter egg image to the console.
 */
export async function logImage(): Promise<void> {
	const { pixels, width, height } = await decodeInWorker();

	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;

	canvas
		.getContext('2d')!
		.putImageData(new ImageData(pixels, width, height), 0, 0);

	const url = canvas.toDataURL();

	console.log(
		'%c ',
		`font-size: 1px; padding: ${height / 4}px ${width / 4}px; background: url(${url}) no-repeat; background-size: ${width / 2}px ${height / 2}px;`,
	);
}
