import React from 'react';

import { doesRenderWithSsr } from '@atlassian/ssr-tests';

import { DropIndicator as Border } from '../../src/border';
import { DropIndicator as Box } from '../../src/box';
import { GroupDropIndicator } from '../../src/group';
import { DropIndicator as ListItem } from '../../src/list-item';
import { DropIndicator as TreeItem } from '../../src/tree-item';

describe('box', () => {
	const value = () => <Box edge="top" />;

	test('can be suspended', async () => {
		await expect(value).toBeSuspendable();
	});

	test('passes strict mode', async () => {
		await expect(value).toPassStrictMode();
	});

	test('can be rendered on the server and hydrated', async () => {
		expect(await doesRenderWithSsr(value())).toBe(true);
	});
});

describe('border', () => {
	const value = () => <Border />;

	test('can be suspended', async () => {
		await expect(value).toBeSuspendable();
	});

	test('passes strict mode', async () => {
		await expect(value).toPassStrictMode();
	});

	test('can be rendered on the server and hydrated', async () => {
		expect(await doesRenderWithSsr(value())).toBe(true);
	});
});

describe('group', () => {
	const value = () => (
		<GroupDropIndicator isActive>
			<div>Content</div>
		</GroupDropIndicator>
	);

	test('can be suspended', async () => {
		await expect(value).toBeSuspendable();
	});

	test('passes strict mode', async () => {
		await expect(value).toPassStrictMode();
	});

	test('can be rendered on the server and hydrated', async () => {
		expect(await doesRenderWithSsr(value())).toBe(true);
	});
});

describe('list-item', () => {
	const value = () => (
		<ListItem
			instruction={{
				operation: 'reorder-before',
				axis: 'vertical',
				blocked: false,
			}}
		/>
	);

	test('can be suspended', async () => {
		await expect(value).toBeSuspendable();
	});

	test('passes strict mode', async () => {
		await expect(value).toPassStrictMode();
	});

	test('can be rendered on the server and hydrated', async () => {
		expect(await doesRenderWithSsr(value())).toBe(true);
	});
});

describe('tree-item', () => {
	const value = () => (
		<TreeItem
			instruction={{
				type: 'reorder-above',
				currentLevel: 0,
				indentPerLevel: 16,
			}}
		/>
	);

	test('can be suspended', async () => {
		await expect(value).toBeSuspendable();
	});

	test('passes strict mode', async () => {
		await expect(value).toPassStrictMode();
	});

	test('can be rendered on the server and hydrated', async () => {
		expect(await doesRenderWithSsr(value())).toBe(true);
	});
});
