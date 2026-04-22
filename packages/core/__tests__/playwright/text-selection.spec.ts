import { expect, test } from '@af/integration-testing';
import { skipAutoA11y } from '@atlassian/a11y-playwright-testing';
test.describe('text selection', () => {
	test('dragging text selection', async ({ page, browserName }) => {
		// This test exposes one or more accessibility violations. Testing is currently skipped but violations need to
		// be fixed in a timely manner or result in escalation. Once all violations have been fixed, you can remove
		// the next line and associated import. For more information, see go/afm-a11y-tooling:playwright
		skipAutoA11y();
		/**
		 * Unfortunately there is a bug with text selection dragging
		 * in Playwright for Chrome and Webkit.
		 * https://github.com/microsoft/playwright/issues/29466
		 */
		// eslint-disable-next-line playwright/no-conditional-in-test
		if (browserName !== 'firefox') {
			return;
		}

		await page.visitExample<typeof import('../../examples/text-selection.tsx')>(
			'pragmatic-drag-and-drop',
			'core',
			'text-selection',
		);
		const dropTarget = page.locator('[data-testid="drop-target"]');
		const text = page.locator('[data-testid="text"]');
		const data = await text.innerText();

		await text.selectText();
		await text.dragTo(dropTarget);

		await expect(dropTarget).toContainText(data);
	});

	test('should capture and report a11y violations', async ({ page, browserName }) => {
		// This test exposes one or more accessibility violations. Testing is currently skipped but violations need to
		// be fixed in a timely manner or result in escalation. Once all violations have been fixed, you can remove
		// the next line and associated import. For more information, see go/afm-a11y-tooling:playwright
		skipAutoA11y();
		// eslint-disable-next-line playwright/no-conditional-in-test
		if (browserName !== 'firefox') {
			return;
		}
		await page.visitExample<typeof import('../../examples/text-selection.tsx')>(
			'pragmatic-drag-and-drop',
			'core',
			'text-selection',
		);
		const dropTarget = page.locator('[data-testid="drop-target"]');
		const text = page.locator('[data-testid="text"]');
		await text.dragTo(dropTarget);

		await expect(page).toBeAccessible();
	});
});
