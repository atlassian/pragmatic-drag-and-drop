import type { Locator, Page } from '@playwright/test';
import invariant from 'tiny-invariant';

import {
	Device,
	type Hooks,
	snapshotInformational,
	type SnapshotTestOptions,
} from '@af/visual-regression';

import BoardExample from '../../examples/01-board';

const variants: SnapshotTestOptions<Hooks>['variants'] = [
	{
		environment: { colorScheme: 'light' },
		name: 'desktop-chrome',
		device: Device.DESKTOP_CHROME,
	},
];

const gap = 10;

async function dragAndDrop({
	page,
	draggable,
	dropTarget,
}: {
	page: Page;
	draggable: Locator;
	dropTarget: Locator;
}) {
	const draggableBox = await draggable.boundingBox();
	invariant(draggableBox, 'unable to get bounding box for draggable');

	const dropTargetBox = await dropTarget.boundingBox();
	invariant(dropTargetBox, 'unable to get bounding box for dropTarget');

	// Start drag
	await page.mouse.move(draggableBox.x + gap, draggableBox.y + gap);
	await page.mouse.down();
	await page.mouse.move(draggableBox.x + gap, draggableBox.y + gap);

	await page.mouse.move(dropTargetBox.x + gap, dropTargetBox.y + gap);
	// Second movement needed to ensure drag preview is updated
	await page.mouse.move(dropTargetBox.x + gap, dropTargetBox.y + gap);

	// Finish the drop
	await page.mouse.up();
}

snapshotInformational(BoardExample, {
	description: 'Smoke test - Board - after card drag and drop',
	variants,
	prepare: async (page) => {
		const cardA0 = page.getByTestId('item-A0');
		const cardB0 = page.getByTestId('item-B0');

		await dragAndDrop({ page, draggable: cardA0, dropTarget: cardB0 });
	},
});

snapshotInformational(BoardExample, {
	description: 'Smoke test - Board - after column drag and drop',
	variants,
	prepare: async (page) => {
		// Drag column A to position of column B
		const columnA = page.getByTestId('column-A--header');

		const columnC = page.getByTestId('column-C--header');

		await dragAndDrop({ page, draggable: columnA, dropTarget: columnC });
	},
});
