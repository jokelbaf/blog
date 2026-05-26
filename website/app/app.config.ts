export default defineAppConfig({
	ui: {
		colors: {
			primary: 'violet',
			neutral: 'slate',
		},
		prose: {
			img: {
				variants: {
					width: {
						false: '!w-auto max-w-full',
					},
				},
			},
		},
	},
});
