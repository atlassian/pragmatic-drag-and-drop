import {
	Device,
	type Hooks,
	snapshotInformational,
	type SnapshotTestOptions,
} from '@af/visual-regression';

import BoardExample, {
	DedicatedColors as DedicatedBoardExample,
} from '../../examples/01-board.vr.ap';
import ReactWindowExample, {
	DedicatedColors as DedicatedReactWindowExample,
} from '../../examples/02-react-window.vr.ap';
import ReactVirtualizedExample, {
	DedicatedColors as DedicatedReactVirtualizedExample,
} from '../../examples/03-react-virtualized.vr.ap';

const variants: SnapshotTestOptions<Hooks>['variants'] = [
	{ name: 'light', environment: { colorScheme: 'light' }, device: Device.DESKTOP_CHROME },
	// eslint-disable-next-line @atlaskit/design-system/no-dark-theme-vr-tests -- DSP-26301 requires light/dark comparisons of the adapter insertion marker.
	{ name: 'dark', environment: { colorScheme: 'dark' }, device: Device.DESKTOP_CHROME },
];

const featureFlags = {
	'platform-dst-tokens-finesse': [false, true],
};

snapshotInformational(BoardExample, {
	description: 'Token colors - standard - standard',
	variants,
	featureFlags,
	prepare: async (page) => {
		await page.getByTestId('item-A0').focus();
		await page.keyboard.press('Space');
		await page.keyboard.press('ArrowRight');
	},
});

snapshotInformational(DedicatedBoardExample, {
	description: 'Token colors - standard - dedicated',
	variants,
	featureFlags,
	prepare: async (page) => {
		await page.getByTestId('item-A0').focus();
		await page.keyboard.press('Space');
		await page.keyboard.press('ArrowRight');
	},
});

snapshotInformational(ReactWindowExample, {
	description: 'Token colors - react-window - standard',
	variants,
	featureFlags,
	prepare: async (page) => {
		await page.getByTestId('item-A0').focus();
		await page.keyboard.press('Space');
		await page.keyboard.press('ArrowRight');
	},
});

snapshotInformational(DedicatedReactWindowExample, {
	description: 'Token colors - react-window - dedicated',
	variants,
	featureFlags,
	prepare: async (page) => {
		await page.getByTestId('item-A0').focus();
		await page.keyboard.press('Space');
		await page.keyboard.press('ArrowRight');
	},
});

snapshotInformational(ReactVirtualizedExample, {
	description: 'Token colors - react-virtualized - standard',
	variants,
	featureFlags,
	prepare: async (page) => {
		await page.getByTestId('item-A0').focus();
		await page.keyboard.press('Space');
		await page.keyboard.press('ArrowRight');
	},
});

snapshotInformational(DedicatedReactVirtualizedExample, {
	description: 'Token colors - react-virtualized - dedicated',
	variants,
	featureFlags,
	prepare: async (page) => {
		await page.getByTestId('item-A0').focus();
		await page.keyboard.press('Space');
		await page.keyboard.press('ArrowRight');
	},
});
