// @atlaskit/pragmatic-drag-and-drop is a public (open source) package.
// These tests guard against accidentally growing the bundle size
// by pulling in large Atlassian-internal dependencies.

import fs from 'fs';
import path from 'path';

// Atlassian feature flag libraries add significant bundle weight
// and should never be shipped to open source consumers.
const blockedPackages = [
	'@atlaskit/platform-feature-flags',
	'@atlaskit/platform-feature-flags-react',
	'@atlaskit/feature-flag-client',
	'@atlassian/feature-flags-test-utils',
	'@atlassian/feature-flag-metrics',
	'@atlassiansox/feature-flag-web-client',
];

// Known violations that need to be cleaned up.
// Do not add to this list - instead, remove the feature flag usage.
const allowlist: string[] = [
	'react-accessibility/src/ambient.d.ts',
	'react-accessibility/src/drag-handle-button-small.tsx',
];

const importPattern = new RegExp(
	blockedPackages.map((pkg) => pkg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'),
);

test('pragmatic-drag-and-drop source files should not import Atlassian feature flag libraries', () => {
	const globby = require('globby');
	const pdndRoot = path.resolve(__dirname, '..', '..', '..');

	const sourceFiles: string[] = globby.sync('*/src/**/*.{ts,tsx}', {
		cwd: pdndRoot,
	});

	expect(sourceFiles.length).toBeGreaterThan(0);

	const violations: string[] = [];

	for (const file of sourceFiles) {
		if (allowlist.includes(file)) {
			continue;
		}

		const fullPath = path.resolve(pdndRoot, file);
		const contents = fs.readFileSync(fullPath, 'utf-8');

		if (importPattern.test(contents)) {
			violations.push(file);
		}
	}

	expect(violations).toEqual([]);
});

// Lock down the core package's dependency list to keep the bundle small for open source consumers.
// If you need to add a dependency, consider the bundle size impact carefully.
const allowedCoreDependencies = ['@babel/runtime', 'bind-event-listener', 'raf-schd'];

test('@atlaskit/pragmatic-drag-and-drop should only have allowed dependencies', () => {
	const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
	const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
	const deps = Object.keys(packageJson.dependencies ?? {});

	expect(deps).toEqual(allowedCoreDependencies);
});
