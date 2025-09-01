import type { Locator, Page } from '@playwright/test';
import type { BoundingBox } from 'puppeteer';
import invariant from 'tiny-invariant';

import {
	Device,
	type Hooks,
	snapshotInformational,
	type SnapshotTestOptions,
} from '@af/visual-regression';

import BoardExample from '../../examples/01-board';
import ReactWindowExample from '../../examples/02-react-window';
import ReactVirtualizedExample from '../../examples/03-react-virtualized';

const variants: SnapshotTestOptions<Hooks>['variants'] = [
	{
		environment: { colorScheme: 'light' },
		name: 'desktop-chrome',
		device: Device.DESKTOP_CHROME,
	},
];

const gap = 8;

function getDropTargetPoint({
	region,
	dropTargetBox,
}: {
	region: 'top-left' | 'bottom-left' | 'center';
	dropTargetBox: BoundingBox;
}): { x: number; y: number } {
	if (region === 'top-left') {
		return {
			x: dropTargetBox.x + gap,
			y: dropTargetBox.y + gap,
		};
	}

	if (region === 'bottom-left') {
		return {
			x: dropTargetBox.x + gap,
			y: dropTargetBox.y + dropTargetBox.height - gap,
		};
	}

	// Center
	return {
		x: dropTargetBox.x + dropTargetBox.width / 2,
		y: dropTargetBox.y + dropTargetBox.height / 2,
	};
}

async function dragToElement({
	page,
	draggable,
	dropTarget,
	region,
}: {
	page: Page;
	draggable: Locator;
	dropTarget: Locator;
	region: 'top-left' | 'bottom-left' | 'center';
}) {
	const draggableBox = await draggable.boundingBox();
	invariant(draggableBox, 'unable to get bounding box for draggable');

	const dropTargetBox = await dropTarget.boundingBox();
	invariant(dropTargetBox, 'unable to get bounding box for dropTarget');

	// Start drag
	await page.mouse.move(draggableBox.x + 1, draggableBox.y + 1);
	await page.mouse.down();
	await page.mouse.move(draggableBox.y + 10, draggableBox.y + 1);

	const dropTargetPoint = getDropTargetPoint({ region, dropTargetBox });

	await page.mouse.move(dropTargetPoint.x, dropTargetPoint.y);
	// Second movement needed to ensure drag preview is updated
	await page.mouse.move(dropTargetPoint.x, dropTargetPoint.y);
}

/**
 * Board example tests
 */
snapshotInformational(BoardExample, {
	description: 'Drop indicators - Board - draggable targets - top position',
	variants,
	prepare: async (page) => {
		const cardA0 = page.getByTestId('item-A0');
		const cardB0 = page.getByTestId('item-B0');

		await dragToElement({ page, draggable: cardA0, dropTarget: cardB0, region: 'top-left' });
	},
});

snapshotInformational(BoardExample, {
	description: 'Drop indicators - Board - draggable targets - bottom position',
	variants,
	prepare: async (page) => {
		const cardA0 = page.getByTestId('item-A0');
		const cardB0 = page.getByTestId('item-B0');

		await dragToElement({ page, draggable: cardA0, dropTarget: cardB0, region: 'bottom-left' });
	},
});

snapshotInformational(BoardExample, {
	description: 'Drop indicators - Board - drag over empty space at the end of droppable',
	variants,
	prepare: async (page) => {
		const cardA0 = page.getByTestId('item-A0');
		const columnC = page.locator('[data-rbd-draggable-id="draggable-C"]');

		await dragToElement({ page, draggable: cardA0, dropTarget: columnC, region: 'bottom-left' });
	},
});

snapshotInformational(BoardExample, {
	description: 'Drop indicators - Board - drag over empty droppable targets',
	variants,
	prepare: async (page) => {
		// Clear cards from column C
		await page.getByRole('button', { name: 'Clear column C' }).click();

		const cardA0 = page.getByTestId('item-A0');
		const columnC = page.locator('[data-rbd-draggable-id="draggable-C"]');

		await dragToElement({ page, draggable: cardA0, dropTarget: columnC, region: 'center' });
	},
});

/**
 * React Window example tests
 */
snapshotInformational(ReactWindowExample, {
	description: 'Drop indicators - React Window - draggable targets - top position',
	variants,
	prepare: async (page) => {
		const cardA0 = page.getByTestId('item-A0');
		const cardB0 = page.getByTestId('item-B0');

		await dragToElement({ page, draggable: cardA0, dropTarget: cardB0, region: 'top-left' });
	},
});

snapshotInformational(ReactWindowExample, {
	description: 'Drop indicators - React Window - draggable targets - bottom position',
	variants,
	prepare: async (page) => {
		const cardA0 = page.getByTestId('item-A0');
		const cardB0 = page.getByTestId('item-B0');

		await dragToElement({ page, draggable: cardA0, dropTarget: cardB0, region: 'bottom-left' });
	},
});

snapshotInformational(ReactWindowExample, {
	description: 'Drop indicators - React Window - drag over empty space at the end of droppable',
	variants,
	prepare: async (page) => {
		const cardA0 = page.getByTestId('item-A0');
		const columnC = page.locator('[data-rbd-draggable-id="draggable-C"]');

		await dragToElement({ page, draggable: cardA0, dropTarget: columnC, region: 'bottom-left' });
	},
});

snapshotInformational(ReactWindowExample, {
	description: 'Drop indicators - React Window - drag over empty droppable targets',
	variants,
	prepare: async (page) => {
		// Clear cards from column C
		await page.getByRole('button', { name: 'Clear column C' }).click();

		const cardA0 = page.getByTestId('item-A0');
		const columnC = page.locator('[data-rbd-draggable-id="draggable-C"]');

		await dragToElement({ page, draggable: cardA0, dropTarget: columnC, region: 'center' });
	},
});

/**
 * React Virtualized example tests
 */
snapshotInformational(ReactVirtualizedExample, {
	description: 'Drop indicators - React Virtualized - draggable targets - top position',
	variants,
	prepare: async (page) => {
		const cardA0 = page.getByTestId('item-A0');
		const cardB0 = page.getByTestId('item-B0');

		await dragToElement({ page, draggable: cardA0, dropTarget: cardB0, region: 'top-left' });
	},
});

snapshotInformational(ReactVirtualizedExample, {
	description: 'Drop indicators - React Virtualized - draggable targets - bottom position',
	variants,
	prepare: async (page) => {
		const cardA0 = page.getByTestId('item-A0');
		const cardB0 = page.getByTestId('item-B0');

		await dragToElement({ page, draggable: cardA0, dropTarget: cardB0, region: 'bottom-left' });
	},
});

snapshotInformational(ReactVirtualizedExample, {
	description:
		'Drop indicators - React Virtualized - drag over empty space at the end of droppable',
	variants,
	prepare: async (page) => {
		const cardA0 = page.getByTestId('item-A0');
		const columnC = page.locator('[data-rbd-draggable-id="draggable-C"]');

		await dragToElement({ page, draggable: cardA0, dropTarget: columnC, region: 'bottom-left' });
	},
});

snapshotInformational(ReactVirtualizedExample, {
	description: 'Drop indicators - React Virtualized - drag over empty droppable targets',
	variants,
	prepare: async (page) => {
		// Clear cards from column C
		await page.getByRole('button', { name: 'Clear column C' }).click();

		const cardA0 = page.getByTestId('item-A0');
		const columnC = page.locator('[data-rbd-draggable-id="draggable-C"]');

		await dragToElement({ page, draggable: cardA0, dropTarget: columnC, region: 'center' });
	},
});
