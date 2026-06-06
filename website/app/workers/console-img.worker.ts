/// <reference lib="webworker" />

import { deobfuscateJs } from '../utils/crypto';
import * as pako from 'pako';

function u32(bytes: Uint8Array, offset: number): number {
	return (
		(bytes[offset]! << 24)
		| (bytes[offset + 1]! << 16)
		| (bytes[offset + 2]! << 8)
		| (bytes[offset + 3]!)
	) >>> 0;
}

export interface DecodedImage {
	ok: true;
	buffer: ArrayBuffer;
	width: number;
	height: number;
}

export interface DecodeError {
	ok: false;
	error: string;
}

const ctx = self as unknown as DedicatedWorkerGlobalScope;

async function run() {
	try {
		const wasm = await import('../../../wasm/module/pkg/module');
		await wasm.default();

		const js = wasm.e();
		const payload = await eval(deobfuscateJs(js)) as Uint8Array;

		const len = u32(payload, 0);
		const decompressed = pako.inflate(payload.slice(4, 4 + len));

		const totalPixels = decompressed.length / 4;
		const width = Math.round(Math.sqrt(totalPixels));
		const height = Math.round(totalPixels / width);

		const buffer = decompressed.buffer as ArrayBuffer;

		ctx.postMessage(
			{
				ok: true,
				buffer,
				width,
				height,
			} satisfies DecodedImage,
			[buffer],
		);
	} catch (error) {
		ctx.postMessage({
			ok: false,
			error: String(error),
		} satisfies DecodeError);
	}
}

void run();
