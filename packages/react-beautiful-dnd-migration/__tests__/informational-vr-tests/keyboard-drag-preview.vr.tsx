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

/**
 * Example: Board (standard lists)
 * Direction: vertical (dragging cards)
 */
snapshotInformational(BoardExample, {
	description: 'Keyboard drag preview - Board - vertical direction - initial position',
	variants,
	prepare: async (page) => {
		const cardA0 = page.getByTestId('item-A0');
		await cardA0.focus();

		await page.keyboard.press('Space');
	},
});

snapshotInformational(BoardExample, {
	description: 'Keyboard drag preview - Board - vertical direction - away position in home list',
	variants,
	prepare: async (page) => {
		const cardA0 = page.getByTestId('item-A0');
		await cardA0.focus();

		await page.keyboard.press('Space');
		// Move down in same list
		await page.keyboard.press('ArrowDown');
	},
});

snapshotInformational(BoardExample, {
	description: 'Keyboard drag preview - Board - vertical direction - returning home in home list',
	variants,
	prepare: async (page) => {
		const cardA0 = page.getByTestId('item-A0');
		await cardA0.focus();

		await page.keyboard.press('Space');
		// Move down in same list, then back to original position (home)
		await page.keyboard.press('ArrowDown');
		await page.keyboard.press('ArrowUp');
	},
});

snapshotInformational(BoardExample, {
	description: 'Keyboard drag preview - Board - vertical direction - away position in away list',
	variants,
	prepare: async (page) => {
		const cardA0 = page.getByTestId('item-A0');
		await cardA0.focus();

		await page.keyboard.press('Space');
		// Move to different list (column C)
		await page.keyboard.press('ArrowRight');
		await page.keyboard.press('ArrowRight');
	},
});

snapshotInformational(BoardExample, {
	description: 'Keyboard drag preview - Board - vertical direction - returning home from away list',
	variants,
	prepare: async (page) => {
		const cardA0 = page.getByTestId('item-A0');
		await cardA0.focus();

		await page.keyboard.press('Space');
		// Move to different list (column C)
		await page.keyboard.press('ArrowRight');
		await page.keyboard.press('ArrowRight');
		// Return to original list (column A)
		await page.keyboard.press('ArrowLeft');
		await page.keyboard.press('ArrowLeft');
	},
});

/**
 * Example: Board (standard lists)
 * Direction: horizontal (dragging columns)
 */
snapshotInformational(BoardExample, {
	description: 'Keyboard drag preview - Board - horizontal direction - initial position',
	variants,
	prepare: async (page) => {
		const columnA = page.getByTestId('column-A--header');
		await columnA.focus();

		await page.keyboard.press('Space');
	},
});

snapshotInformational(BoardExample, {
	description: 'Keyboard drag preview - Board - horizontal direction - away position',
	variants,
	prepare: async (page) => {
		const columnA = page.getByTestId('column-A--header');
		await columnA.focus();

		await page.keyboard.press('Space');

		// Move between columns B and C
		await page.keyboard.press('ArrowRight');
	},
});

snapshotInformational(BoardExample, {
	description: 'Keyboard drag preview - Board - horizontal direction - returning home',
	variants,
	prepare: async (page) => {
		const columnA = page.getByTestId('column-A--header');
		await columnA.focus();

		await page.keyboard.press('Space');
		// Move between columns B and C, then back to original position
		await page.keyboard.press('ArrowRight');
		await page.keyboard.press('ArrowLeft');
	},
});

/**
 * Example: React window
 * Direction: vertical (dragging cards)
 */
snapshotInformational(ReactWindowExample, {
	description: 'Keyboard drag preview - React window - vertical direction - initial position',
	variants,
	prepare: async (page) => {
		const cardA0 = page.getByTestId('item-A0');
		await cardA0.focus();

		await page.keyboard.press('Space');
	},
});

snapshotInformational(ReactWindowExample, {
	description:
		'Keyboard drag preview - React window - vertical direction - away position in home list',
	variants,
	prepare: async (page) => {
		const cardA0 = page.getByTestId('item-A0');
		await cardA0.focus();

		await page.keyboard.press('Space');
		// Move down in same list
		await page.keyboard.press('ArrowDown');
	},
});

snapshotInformational(ReactWindowExample, {
	description:
		'Keyboard drag preview - React window - vertical direction - returning home in home list',
	variants,
	prepare: async (page) => {
		const cardA0 = page.getByTestId('item-A0');
		await cardA0.focus();

		await page.keyboard.press('Space');
		// Move down in same list, then back to original position (home)
		await page.keyboard.press('ArrowDown');
		await page.keyboard.press('ArrowUp');
	},
});

snapshotInformational(ReactWindowExample, {
	description:
		'Keyboard drag preview - React window - vertical direction - away position in away list',
	variants,
	prepare: async (page) => {
		const cardA0 = page.getByTestId('item-A0');
		await cardA0.focus();

		await page.keyboard.press('Space');
		// Move to different list (column C)
		await page.keyboard.press('ArrowRight');
		await page.keyboard.press('ArrowRight');
	},
});

snapshotInformational(ReactWindowExample, {
	description:
		'Keyboard drag preview - React window - vertical direction - returning home from away list',
	variants,
	prepare: async (page) => {
		const cardA0 = page.getByTestId('item-A0');
		await cardA0.focus();

		await page.keyboard.press('Space');
		// Move to different list (column C)
		await page.keyboard.press('ArrowRight');
		await page.keyboard.press('ArrowRight');
		// Return to original list (column A)
		await page.keyboard.press('ArrowLeft');
		await page.keyboard.press('ArrowLeft');
	},
});

/**
 * Example: React window
 * Direction: horizontal (dragging columns)
 */
snapshotInformational(ReactWindowExample, {
	description: 'Keyboard drag preview - React window - horizontal direction - initial position',
	variants,
	prepare: async (page) => {
		const columnA = page.getByTestId('column-A--header');
		await columnA.focus();

		await page.keyboard.press('Space');
	},
});

snapshotInformational(ReactWindowExample, {
	description: 'Keyboard drag preview - React window - horizontal direction - away position',
	variants,
	prepare: async (page) => {
		const columnA = page.getByTestId('column-A--header');
		await columnA.focus();

		await page.keyboard.press('Space');

		// Move between columns B and C
		await page.keyboard.press('ArrowRight');
	},
});

snapshotInformational(ReactWindowExample, {
	description: 'Keyboard drag preview - React window - horizontal direction - returning home',
	variants,
	prepare: async (page) => {
		const columnA = page.getByTestId('column-A--header');
		await columnA.focus();

		await page.keyboard.press('Space');
		// Move between columns B and C, then back to original position
		await page.keyboard.press('ArrowRight');
		await page.keyboard.press('ArrowLeft');
	},
});

/**
 * Example: React virtualized
 * Direction: vertical (dragging cards)
 */
snapshotInformational(ReactVirtualizedExample, {
	description: 'Keyboard drag preview - React virtualized - vertical direction - initial position',
	variants,
	prepare: async (page) => {
		const cardA0 = page.getByTestId('item-A0');
		await cardA0.focus();

		await page.keyboard.press('Space');
	},
});

snapshotInformational(ReactVirtualizedExample, {
	description:
		'Keyboard drag preview - React virtualized - vertical direction - away position in home list',
	variants,
	prepare: async (page) => {
		const cardA0 = page.getByTestId('item-A0');
		await cardA0.focus();

		await page.keyboard.press('Space');
		// Move down in same list
		await page.keyboard.press('ArrowDown');
	},
});

snapshotInformational(ReactVirtualizedExample, {
	description:
		'Keyboard drag preview - React virtualized - vertical direction - returning home in home list',
	variants,
	prepare: async (page) => {
		const cardA0 = page.getByTestId('item-A0');
		await cardA0.focus();

		await page.keyboard.press('Space');
		// Move down in same list, then back to original position (home)
		await page.keyboard.press('ArrowDown');
		await page.keyboard.press('ArrowUp');
	},
});

snapshotInformational(ReactVirtualizedExample, {
	description:
		'Keyboard drag preview - React virtualized - vertical direction - away position in away list',
	variants,
	prepare: async (page) => {
		const cardA0 = page.getByTestId('item-A0');
		await cardA0.focus();

		await page.keyboard.press('Space');
		// Move to different list (column C)
		await page.keyboard.press('ArrowRight');
		await page.keyboard.press('ArrowRight');
	},
});

snapshotInformational(ReactVirtualizedExample, {
	description:
		'Keyboard drag preview - React virtualized - vertical direction - returning home from away list',
	variants,
	prepare: async (page) => {
		const cardA0 = page.getByTestId('item-A0');
		await cardA0.focus();

		await page.keyboard.press('Space');
		// Move to different list (column C)
		await page.keyboard.press('ArrowRight');
		await page.keyboard.press('ArrowRight');
		// Return to original list (column A)
		await page.keyboard.press('ArrowLeft');
		await page.keyboard.press('ArrowLeft');
	},
});

/**
 * Example: React virtualized
 * Direction: horizontal (dragging columns)
 */
snapshotInformational(ReactVirtualizedExample, {
	description:
		'Keyboard drag preview - React virtualized - horizontal direction - initial position',
	variants,
	prepare: async (page) => {
		const columnA = page.getByTestId('column-A--header');
		await columnA.focus();

		await page.keyboard.press('Space');
	},
});

snapshotInformational(ReactVirtualizedExample, {
	description: 'Keyboard drag preview - React virtualized - horizontal direction - away position',
	variants,
	prepare: async (page) => {
		const columnA = page.getByTestId('column-A--header');
		await columnA.focus();

		await page.keyboard.press('Space');

		// Move between columns B and C
		await page.keyboard.press('ArrowRight');
	},
});

snapshotInformational(ReactVirtualizedExample, {
	description: 'Keyboard drag preview - React virtualized - horizontal direction - returning home',
	variants,
	prepare: async (page) => {
		const columnA = page.getByTestId('column-A--header');
		await columnA.focus();

		await page.keyboard.press('Space');
		// Move between columns B and C, then back to original position
		await page.keyboard.press('ArrowRight');
		await page.keyboard.press('ArrowLeft');
	},
});
