// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'CStack Docs',
			social: {
				github: 'https://github.com/withastro/starlight',
			},
			sidebar: [
				{
					label: 'Components',
					items: [
						// Each item here is one entry in the navigation menu.
						{ label: 'about', slug: 'components/about' },
					],
				}
			],
		}),
	],
});
