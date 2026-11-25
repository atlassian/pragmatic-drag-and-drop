import { expect, type Page, test } from '@af/integration-testing';

/**
 * After a move from a drag handle menu, focus is back on the drag handle, so the user can move the
 * item again. "Move to top" disables the activated item (Chromium then moves focus to `<body>`), and
 * "Move to bottom" moves the item, and its open menu, in the DOM.
 */

const itemLabel = 'Update company website content';

async function moveFromMenu({
	page,
	isTopLayer,
	action,
}: {
	page: Page;
	isTopLayer: boolean;
	action: string;
}) {
	await page.visitExample<typeof import('../../examples/list.vr.ap.tsx')>(
		'pragmatic-drag-and-drop',
		'documentation',
		'list',
		isTopLayer ? { featureFlag: 'platform-dst-top-layer' } : {},
	);
	const handle = page.getByRole('button', { name: `Reorder ${itemLabel}` });
	await handle.focus();
	await page.keyboard.press('Enter');
	const menuItem = page.getByRole('menuitem', { name: action });
	await menuItem.focus();
	await page.keyboard.press('Enter');
	await expect(menuItem).toBeHidden();
}

for (const { isTopLayer, title } of [
	{ isTopLayer: true, title: 'list: drag handle menu (top layer)' },
	{ isTopLayer: false, title: 'list: drag handle menu (legacy)' },
]) {
	test.describe(title, () => {
		test('"Move to top" moves the item and returns focus to its drag handle', async ({ page }) => {
			await moveFromMenu({ page, isTopLayer, action: 'Move to top' });

			const handles = page.getByRole('button', { name: /^Reorder / });
			await expect(handles.first()).toHaveAccessibleName(`Reorder ${itemLabel}`);
			await expect(handles.first()).toBeFocused();
		});

		test('"Move to bottom" moves the item and returns focus to its drag handle', async ({
			page,
		}) => {
			await moveFromMenu({ page, isTopLayer, action: 'Move to bottom' });

			const handles = page.getByRole('button', { name: /^Reorder / });
			await expect(handles.last()).toHaveAccessibleName(`Reorder ${itemLabel}`);
			await expect(handles.last()).toBeFocused();
		});
	});
}
