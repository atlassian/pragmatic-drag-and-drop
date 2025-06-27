import invariant from 'tiny-invariant';

import { expect as baseExpect, type Locator, test } from '@af/integration-testing';

type Data = {
	mouseenter: number;
	mouseleave: number;
	dragstart: number;
	drop: number;
};

// adding our own custom matcher
const expect = baseExpect.extend({
	async toContainData(locator: Locator, expected: Partial<Data>) {
		const assertionName = 'toContainData';
		let pass: boolean;
		let matcherResult: any;
		try {
			for (let [key, value] of Object.entries(expected)) {
				// eslint-disable-next-line playwright/no-standalone-expect
				await expect(locator).toContainText(`${key}:${value}`);
			}
			pass = true;
		} catch (e: any) {
			matcherResult = e.matcherResult;
			pass = false;
		}

		// copy pasted from
		// https://playwright.dev/docs/test-assertions#add-custom-matchers-using-expectextend
		const message = pass
			? () =>
					this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
					'\n\n' +
					`Locator: ${locator}\n` +
					`Expected: ${this.isNot ? 'not' : ''}${this.utils.printExpected(expected)}\n` +
					(matcherResult ? `Received: ${this.utils.printReceived(matcherResult.actual)}` : '')
			: () =>
					this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
					'\n\n' +
					`Locator: ${locator}\n` +
					`Expected: ${this.utils.printExpected(expected)}\n` +
					(matcherResult ? `Received: ${this.utils.printReceived(matcherResult.actual)}` : '');

		return {
			message,
			pass,
			name: assertionName,
			expected,
			actual: matcherResult?.actual,
		};
	},
});

const notTouched: Data = { mouseenter: 0, mouseleave: 0, dragstart: 0, drop: 0 };

test.describe('honey pot', () => {
	test('no "mouseenter" on incorrect elements after a drag', async ({ page }) => {
		await page.visitExample('pragmatic-drag-and-drop', 'core', 'post-drop-bug-fix-simple');
		const card0 = page.locator('[data-testid="card-0"]');
		const card1 = page.locator('[data-testid="card-1"]');
		const dragCount = page.locator('[data-testid="drag-count"]');
		const box0 = await card0.boundingBox();
		const box1 = await card1.boundingBox();
		invariant(box0);
		invariant(box1);

		await expect(card0).toContainData(notTouched);
		await expect(card1).toContainData(notTouched);
		await expect(dragCount).toContainText('Drags completed: 0');

		// start a drag
		await page.mouse.move(box0.x + 1, box0.y + 1);
		await page.mouse.down();
		await page.mouse.move(box0.x + 10, box0.y + 1);

		// Not asserting that 'leave' has changed.
		// The honey pot will cause a 'leave' that won't happen
		// until a bit later when not using the honey pot
		await expect(card0).toContainData({ mouseenter: 1, dragstart: 1, drop: 0 });
		await expect(card1).toContainData(notTouched);

		// drag over card1
		await page.mouse.move(box1.x + 1, box1.y + 1);

		// card 1 still not touched
		await expect(card1).toContainData(notTouched);

		// dropped on card 1 which will swap card0 with card1
		await page.mouse.up();

		// waiting for drop to finish
		await expect(dragCount).toContainText('Drags completed: 1');

		await expect(card1).toContainData({ drop: 1, mouseenter: 0, mouseleave: 0 });
		// Honey pot fix at work: counts have not incremented on card0
		await expect(card0).toContainData({ mouseenter: 1, dragstart: 1, drop: 0 });
	});

	test('no "mouseenter" on incorrect elements during a drag', async ({ page }) => {
		await page.visitExample('pragmatic-drag-and-drop', 'core', 'post-drop-bug-fix-simple');
		const card0 = page.locator('[data-testid="card-0"]');
		const card1 = page.locator('[data-testid="card-1"]');
		const dragCount = page.locator('[data-testid="drag-count"]');
		const box0 = await card0.boundingBox();
		const box1 = await card1.boundingBox();
		invariant(box0);
		invariant(box1);

		await expect(card0).toContainData(notTouched);
		await expect(card1).toContainData(notTouched);
		await expect(dragCount).toContainText('Drags completed: 0');

		// start a drag
		await page.mouse.move(box0.x + 1, box0.y + 1);
		await page.mouse.down();
		await page.mouse.move(box0.x + 10, box0.y + 1);

		// Not asserting that 'leave' has changed.
		// The honey pot will cause a 'leave' that won't happen
		// until a bit later when not using the honey pot
		await expect(card0).toContainData({ mouseenter: 1, dragstart: 1, drop: 0 });
		await expect(card1).toContainData(notTouched);

		// this seems to be the most reliable way to scroll to the bottom
		await page.locator('[data-testid="scroll-container"]').evaluate((element) => {
			element.scrollTop = element.scrollHeight;
		});

		// we should have scrolled enough that card0 is no longer visible
		await expect(card0).not.toBeInViewport();

		// check that no elements have been entered into by the mouse
		for (let i = 2; i <= 29; i++) {
			const locator = page.locator(`[data-testid="card-${i}"]`);
			await expect(locator).toContainData(notTouched);
		}
	});

	test('should capture and report a11y violations', async ({ page }) => {
		await page.visitExample('pragmatic-drag-and-drop', 'core', 'post-drop-bug-fix-simple');
		const card0 = page.locator('[data-testid="card-0"]');
		await expect(card0).toContainData(notTouched);

		await expect(page).toBeAccessible({ violationCount: 1 });
	});
});
