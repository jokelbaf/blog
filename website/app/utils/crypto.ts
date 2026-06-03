const JS_OBFUSCATION_KEY = [
	0x6d, 0x31, 0xc7, 0x94, 0x52, 0x0f, 0xa8, 0xe3,
	0x19, 0xbb, 0x74, 0x2d, 0x80, 0x46, 0xd5, 0x0a,
];

/**
 * Deobfuscate JS code received from wasm module.
 *
 * @param obfuscated The obfuscated JS code as a hex string.
 * @returns The deobfuscated JS code as a string.
 */
export function deobfuscateJs(obfuscated: string): string {
	const bytes = new Uint8Array(obfuscated.length / 2);

	for (let i = 0; i < bytes.length; i++) {
		const hex = obfuscated.slice(i * 2, i * 2 + 2);

		const byte = Number.parseInt(hex, 16);
		bytes[i] = deobfuscateJsByte(byte, i, bytes.length);
	}

	return new TextDecoder().decode(bytes);
}

function deobfuscateJsByte(byte: number, index: number, length: number): number {
	const key = JS_OBFUSCATION_KEY[index % JS_OBFUSCATION_KEY.length]!;
	const shift = (index % 7) + 1;
	const offset = (index * 31 + 17) & 0xff;
	const mask = rotateLeft8(((length & 0xff) + (index & 0xff)) & 0xff, 3);

	return rotateRight8((byte ^ mask) - offset, shift) ^ key;
}

function rotateLeft8(value: number, shift: number): number {
	return ((value << shift) | (value >>> (8 - shift))) & 0xff;
}

function rotateRight8(value: number, shift: number): number {
	value &= 0xff;
	return ((value >>> shift) | (value << (8 - shift))) & 0xff;
}
