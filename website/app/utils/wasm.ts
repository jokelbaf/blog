import { deobfuscateJs } from './crypto';
import * as pako from 'pako';

function u32(bytes: Uint8Array, offset: number): number {
	return (
		(bytes[offset]! << 24)
		| (bytes[offset + 1]! << 16)
		| (bytes[offset + 2]! << 8)
		| (bytes[offset + 3]!)
	) >>> 0;
}

/**
 * Log the easter egg image to the console.
 */
export async function logImage(): Promise<void> {
	const wasm = await import('../../../wasm/module/pkg/module');
	await wasm.default();

	const js = wasm.e();
	const payload = await eval(deobfuscateJs(js)) as Uint8Array;

	const len = u32(payload, 0);
	const decompressed = pako.inflate(payload.slice(4, 4 + len));

	const totalPixels = decompressed.length / 4;
	const width = Math.round(Math.sqrt(totalPixels));
	const height = Math.round(totalPixels / width);

	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	canvas.getContext('2d')!.putImageData(
		new ImageData(new Uint8ClampedArray(decompressed), width, height),
		0, 0,
	);

	const url = canvas.toDataURL();
	console.log(
		'%c ',
		`font-size: 1px; padding: ${height / 4}px ${width / 4}px; background: url(${url}) no-repeat; background-size: ${width / 2}px ${height / 2}px;`,
	);
}
