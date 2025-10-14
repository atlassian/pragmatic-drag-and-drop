import {
	Device,
	type Hooks,
	snapshotInformational,
	type SnapshotTestOptions,
} from '@af/visual-regression';

import ScrollContainerExample from '../../examples/05-scroll-container';

const variants: SnapshotTestOptions<Hooks>['variants'] = [
	{
		environment: { colorScheme: 'light' },
		name: 'desktop-chrome',
		device: Device.DESKTOP_CHROME,
	},
];

/**
 * Context: there was a bug that caused the drop indicator to incorrectly
 * render at the top of the scroll container, scrolling the container with it.
 *
 * This would occur when returning home because the drag preview was being
 * measured to determine where to put the indicator.
 *
 * Now, when over home, the placeholder is used instead of the drag preview.
 */

snapshotInformational(ScrollContainerExample, {
	description: 'Scroll container - keyboard controls - returning home from target before',
	variants,
	prepare: async (page) => {
		// Scroll the container to the bottom
		await page.getByRole('button', { name: 'Scroll to bottom' }).click();

		// Focus on the first item and start keyboard drag
		const card = page.getByTestId('card-9');
		await card.focus();
		await page.keyboard.press('Space');

		// Move to target before
		await page.keyboard.press('ArrowUp');
		// Move back to the home location
		await page.keyboard.press('ArrowDown');
	},
});

snapshotInformational(ScrollContainerExample, {
	description: 'Scroll container - keyboard controls - returning home from target after',
	variants,
	prepare: async (page) => {
		// Scroll the container to the bottom
		await page.getByRole('button', { name: 'Scroll to bottom' }).click();

		// Focus on an item that can move up and start keyboard drag
		const card = page.getByTestId('card-9');
		await card.focus();
		await page.keyboard.press('Space');

		// Move to the target after
		await page.keyboard.press('ArrowDown');
		// Move back to the home location
		await page.keyboard.press('ArrowUp');
	},
});
