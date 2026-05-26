/**
 * Log the easter egg image to the console.
 */
export async function logImage() {
	const wasm = await import('../../../wasm/pkg/wasm');
	await wasm.default();

	const generated = wasm.e();

	eval(generated);
}
