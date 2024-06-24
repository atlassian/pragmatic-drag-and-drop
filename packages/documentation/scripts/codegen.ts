import fs from 'fs/promises';
import path from 'path';

import glob from 'fast-glob';

import { createSignedArtifact } from '@atlassian/codegen';

async function generateSVGDataURIs() {
	const imageFolder = path.resolve(__dirname, '../examples/data/people/images');
	const svgFiles = await glob(`${imageFolder}/raw/*.svg`);

	await Promise.all(
		svgFiles.map(async (file) => {
			const svg = await fs.readFile(file, { encoding: 'utf8' });

			const dataURI = `data:image/svg+xml,${svg.replace(/\n/g, '').replace(/[#<>]/g, encodeURIComponent)}`;
			const source = `export default '${dataURI}'`;

			const signedSource = createSignedArtifact(
				source,
				'yarn workspace @atlaskit/pragmatic-drag-and-drop-docs codegen',
				'This exists to workaround CodeSandbox issues with importing SVGs',
			);

			const outputFolder = path.join(imageFolder, 'processed');

			// Using `recursive: true` so it doesn't throw if it already exists
			await fs.mkdir(outputFolder, { recursive: true });

			await fs.writeFile(
				path.join(outputFolder, path.basename(file).replace('.svg', '.ts')),
				signedSource,
			);
		}),
	);
}

generateSVGDataURIs();
