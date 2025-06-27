import { readFileSync } from 'fs';
import path from 'path';

import invariant from 'tiny-invariant';

import { expect, type Page, test } from '@af/integration-testing';

async function getElement(page: Page, selector: string) {
	const result = page.locator(selector);
	invariant(result !== null);
	return result;
}

test.describe('file dropping', () => {
	test('should support dropping of many files at once', async ({ browserName, page }) => {
		// eslint-disable-next-line playwright/no-conditional-in-test
		if (browserName === 'webkit') {
			/**
			 * We are skipping this specific test for webkit due to failures.
			 *
			 * https://github.com/microsoft/playwright/issues/10667#issuecomment-1462668995
			 * indicates that this is due to webkit not support DataTransfer
			 * construction, but further investigation may be needed.
			 *
			 * We are still keeping webkit tests enabled for the package,
			 * because tests unrelated to files still work.
			 */
			return;
		}

		await page.visitExample('pragmatic-drag-and-drop', 'core', 'file');

		// waiting for the drop target to be visible as a way to ensure the example
		// is completely loaded (preemptively avoiding flakiness)
		await page.locator('[data-drop-target-for-external]').waitFor({ state: 'visible' });

		const fileData = [
			{
				name: 'package.json',
				data: readFileSync(path.resolve(__dirname, '../../package.json')),
			},
			{
				name: 'tsconfig.json',
				data: readFileSync(path.resolve(__dirname, '../../tsconfig.json')),
			},
		];

		await page.evaluateHandle((data) => {
			const dataTransfer = new DataTransfer();

			data.forEach((file) => {
				dataTransfer.items.add(
					new File([file.data.toString('utf8')], file.name, {
						type: 'application/json',
					}),
				);
			});

			/**
			 * The drag enter on the window is what 'activates' the file adapter
			 */
			window.dispatchEvent(new DragEvent('dragenter', { dataTransfer }));

			const dropTarget = document.querySelector('[data-testid="drop-target"]');
			if (!dropTarget) {
				throw new Error('no drop target');
			}

			dropTarget.dispatchEvent(new DragEvent('dragover', { dataTransfer }));
			dropTarget.dispatchEvent(new DragEvent('drop', { dataTransfer }));
		}, fileData);

		// just incase there are any delays in the processing of files
		// we will wait until the `dropped-files` element is visible
		// before continuing
		// (eg if the update is delayed by react)
		await page.locator('[data-testid="dropped-files"]').waitFor({ state: 'visible' });

		const results = await getElement(page, '[data-testid="dropped-files"]');
		const text = await results.textContent();
		expect(text?.includes('package.json')).toBe(true);
		expect(text?.includes('tsconfig.json')).toBe(true);
	});

	test('should capture and report a11y violations', async ({ browserName, page }) => {
		// eslint-disable-next-line playwright/no-conditional-in-test
		if (browserName === 'webkit') {
			return;
		}
		await page.visitExample('pragmatic-drag-and-drop', 'core', 'file');
		await page.locator('[data-drop-target-for-external]').waitFor({ state: 'visible' });

		await expect(page).toBeAccessible({ violationCount: 1 });
	});
});
