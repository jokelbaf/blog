// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt(
	{
		rules: {
			'vue/html-quotes': ['error', 'double'],
			'@stylistic/indent': ['error', 'tab', { tabLength: 4 }],
			'@stylistic/no-tabs': 'off',
			'vue/html-indent': ['error', 'tab'],
			'vue/comma-dangle': ['error', 'always-multiline'],
		},
	},
);
