import { expect, type Page, test } from '@af/integration-testing';

/**
 * A drag handle that opens a menu with a mouse press. Safari does not focus a button on a click,
 * so `DragHandleButton` sets `tabIndex={0}` there (as `Pressable` does), and the menu records the
 * handle as its opener. The menu runs with `platform-dst-top-layer` on and off.
 */

async function openWithMouse({ page, isTopLayer }: { page: Page; isTopLayer: boolean }) {
	// No entry animation, so the menu is visible as soon as it opens.
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.visitExample<typeof import('../../examples/drag-handle-dropdown-menu.tsx')>(
		'pragmatic-drag-and-drop',
		'react-accessibility',
		'drag-handle-dropdown-menu',
		isTopLayer ? { featureFlag: 'platform-dst-top-layer' } : {},
	);
	await page.getByRole('button', { name: 'Reorder' }).click();
	await expect(page.getByRole('menuitem', { name: 'Move up' })).toBeVisible();
}

for (const { isTopLayer, title } of [
	{ isTopLayer: true, title: 'DragHandleButton menu (top layer)' },
	{ isTopLayer: false, title: 'DragHandleButton menu (legacy)' },
]) {
	test.describe(title, () => {
		test('Escape returns focus to the handle', async ({ page }) => {
			await openWithMouse({ page, isTopLayer });

			await page.keyboard.press('Escape');

			await expect(page.getByRole('menuitem', { name: 'Move up' })).toBeHidden();
			await expect(page.getByRole('button', { name: 'Reorder' })).toBeFocused();
		});

		// On the top layer, focus after an item is chosen is `@atlaskit/dropdown-menu`'s
		// (`item-focus-return.spec.tsx`).
		if (!isTopLayer) {
			test('a mouse press on an item returns focus to the handle', async ({ page }) => {
				await openWithMouse({ page, isTopLayer });

				await page.getByRole('menuitem', { name: 'Move up' }).click();

				await expect(page.getByRole('menuitem', { name: 'Move up' })).toBeHidden();
				await expect(page.getByRole('button', { name: 'Reorder' })).toBeFocused();
			});
		}
	});
}
