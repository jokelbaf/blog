import { fileURLToPath } from 'node:url';
import obfuscator from 'vite-plugin-bundle-obfuscator';
import { definePerson } from 'nuxt-schema-org/schema';

const wasmPkgPath = fileURLToPath(new URL('../wasm/module/pkg', import.meta.url));

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	modules: [
		'@nuxt/eslint',
		'@nuxt/ui',
		'@nuxtjs/mdc',
		'motion-v/nuxt',
		'nuxt-auth-utils',
		'nuxt-file-storage',
		'@artmizu/nuxt-prometheus',
		'@nuxtjs/seo',
	],

	devtools: {
		enabled: true,
	},

	css: ['~/assets/css/main.css'],

	site: {
		url: 'https://blog.jokelbaf.dev',
		name: 'JokelBaf\'s Blog',
		defaultLocale: 'en',
	},

	mdc: {
		highlight: {
			langs: ['js', 'jsx', 'json', 'ts', 'tsx', 'vue', 'css', 'html', 'bash', 'md', 'mdc', 'yaml', 'python', 'c', 'cpp', 'rust', 'go', 'java', 'sql'],
		},
		remarkPlugins: {
			'remark-ins': { src: 'remark-ins' },
		},
	},

	runtimeConfig: {
		githubToken: process.env.GITHUB_TOKEN,
		githubOwner: process.env.GITHUB_OWNER,
		githubRepo: process.env.GITHUB_REPO,
	},

	devServer: {
		port: 13013,
	},

	experimental: {
		typedPages: true,
	},

	compatibilityDate: '2025-01-15',

	vite: {
		worker: {
			format: 'es',
		},
		server: {
			allowedHosts: true,
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
				'pako',
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
					controlFlowFlatteningThreshold: 0.5,
					deadCodeInjection: true,
					deadCodeInjectionThreshold: 0.1,
					numbersToExpressions: true,
					splitStrings: true,
					splitStringsChunkLength: 10,
					stringArray: true,
					stringArrayEncoding: ['base64'],
					stringArrayRotate: true,
					stringArrayShuffle: true,
					stringArrayIndexShift: true,
					stringArrayCallsTransform: true,
					stringArrayCallsTransformThreshold: 0.5,
					stringArrayWrappersCount: 1,
					stringArrayWrappersChainedCalls: true,
					stringArrayWrappersType: 'function',
					stringArrayIndexesType: ['hexadecimal-number', 'hexadecimal-numeric-string'],
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

	ogImage: {
		defaults: {
			width: 1200,
			height: 630,
			extension: 'png',
		},
	},

	prometheus: {
		prometheusPath: '/api/metrics',
		healthCheckPath: '/api/health',
	},

	schemaOrg: {
		identity: definePerson({
			name: 'JokelBaf',

			image: '/avatar.png',
			description: 'A full-stack developer and reverse engineer who loves to write about technology and programming.',

			url: 'jokelbaf.dev',
			sameAs: [
				'https://twitter.com/jokelbaf',
				'https://github.com/jokelbaf',
			],
		}),
	},

	sitemap: {
		sources: ['/api/__sitemap__/urls'],
	},
});
