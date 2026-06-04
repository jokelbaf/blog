import { fileURLToPath } from 'node:url';
import obfuscator from 'vite-plugin-bundle-obfuscator';

const wasmPkgPath = fileURLToPath(new URL('../wasm/module/pkg', import.meta.url));

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	modules: ['@nuxt/eslint', '@nuxt/ui', '@nuxtjs/mdc', 'motion-v/nuxt', 'nuxt-auth-utils', 'nuxt-file-storage', '@artmizu/nuxt-prometheus'],

	devtools: {
		enabled: true,
	},

	css: ['~/assets/css/main.css'],

	mdc: {
		highlight: {
			langs: ['js', 'jsx', 'json', 'ts', 'tsx', 'vue', 'css', 'html', 'bash', 'md', 'mdc', 'yaml', 'python', 'c', 'cpp', 'rust', 'go', 'java', 'sql'],
		},
		remarkPlugins: {
			'remark-ins': { src: 'remark-ins' },
		},
	},

	devServer: {
		port: 13013,
	},

	experimental: {
		typedPages: true,
	},

	compatibilityDate: '2025-01-15',

	vite: {
		server: {
			allowedHosts: ['20d1-93-127-127-112.ngrok-free.app'],
			fs: {
				allow: [wasmPkgPath],
			},
		},
		optimizeDeps: {
			include: [
				'@ai-sdk/vue',
				'@vueuse/core',
				'tiptap-extension-code-block-shiki',
				'@tiptap/core',
				'@tiptap/vue-3',
				'remark-ins',
			],
			exclude: [
				'@tiptap/pm',
				'@tiptap/pm/state',
				'@tiptap/pm/view',
			],
		},
		plugins: [
			obfuscator({
				log: true,
				autoExcludeNodeModules: true,
				threadPool: true,
				options: {
					compact: true,
					controlFlowFlattening: true,
					controlFlowFlatteningThreshold: 1,
					deadCodeInjection: true,
					deadCodeInjectionThreshold: 0.2,
					numbersToExpressions: true,
					splitStrings: true,
					splitStringsChunkLength: 5,
					stringArray: true,
					stringArrayEncoding: ['rc4'],
					stringArrayRotate: true,
					stringArrayShuffle: true,
					stringArrayIndexShift: true,
					stringArrayCallsTransform: true,
					stringArrayCallsTransformThreshold: 0.5,
					stringArrayWrappersCount: 2,
					stringArrayWrappersChainedCalls: true,
					stringArrayWrappersType: 'function',
					stringArrayIndexesType: ['hexadecimal-number', 'hexadecimal-numeric-string'],
					transformObjectKeys: true,
					renameGlobals: true,
					simplify: true,
				},
			}),
		],
	},

	eslint: {
		config: {
			stylistic: {
				semi: true,
				quotes: 'single',
				commaDangle: 'always-multiline',
				indent: 'tab',
				braceStyle: '1tbs',
			},
		},
	},

	fileStorage: {
		mount: process.env.FILES_MOUNT_PATH,
	},

	prometheus: {
		prometheusPath: '/api/metrics',
		healthCheckPath: '/api/health',
	},
});
