import React from 'react';

import { doesSsrRenderOnly as doesRenderWithSsr } from '@atlassian/ssr-tests/ssr-tests';

import { DropIndicator as Border } from '../../src/border';
import { DropIndicator as Box } from '../../src/box';
import { GroupDropIndicator } from '../../src/group';
import { DropIndicator as ListItem } from '../../src/list-item';
import { DropIndicator as TreeItem } from '../../src/tree-item';
import type { Colors } from '../../src/types';

describe.each<Colors>(['standard', 'dedicated'])('colors=%s', (colors) => {
	describe('box', () => {
		const value = () => <Box edge="top" colors={colors} />;

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
		const value = () => <Border colors={colors} />;

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
			<GroupDropIndicator isActive colors={colors}>
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
				colors={colors}
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
				colors={colors}
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
});
