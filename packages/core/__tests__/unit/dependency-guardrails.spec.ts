// @atlaskit/pragmatic-drag-and-drop is a public (open source) package.
// This test guards against accidentally growing its dependency list and bundle size.

import fs from 'fs';
import path from 'path';

// Lock down the core package's dependency list to keep the bundle small for open source consumers.
// If you need to add a dependency, consider the bundle size impact carefully.
const allowedCoreDependencies = ['@babel/runtime', 'bind-event-listener', 'raf-schd'];

test('@atlaskit/pragmatic-drag-and-drop should only have allowed dependencies', () => {
	const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
	const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
	const deps = Object.keys(packageJson.dependencies ?? {});

	expect(deps).toEqual(allowedCoreDependencies);
});
