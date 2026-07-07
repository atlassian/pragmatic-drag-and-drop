import invariant from 'tiny-invariant';

import { expect, type Page, test } from '@af/integration-testing';

/**
 * These tests verify the popover-based honey pot behaves correctly in a real
 * browser. They complement `honey-pot.spec.ts` (which asserts behavioural
 * outcomes such as "no mouseenter on incorrect elements") by asserting the
 * underlying mechanism: top-layer promotion via the Popover API and the
 * `data-pdnd-honey-pot` skip logic in `getElementFromPointWithoutHoneypot`.
 *
 * Cross-browser context (validated manually 2026-06):
 *
 * - Chromium, Firefox, and WebKit all support `showPopover()` and all open
 *   the popover during a drag.
 * - Whether `document.elementsFromPoint(...)` returns the popover at index 0
 *   varies by engine and drag layout, which is why we only assert that the
 *   PDND skip logic itself never returns the honey pot.
 */

const honeyPotSelector = '[data-pdnd-honey-pot]';

type TSkipProbeResult = {
	skipHoneyPotDescription: string | null;
};

/**
 * Replicates the PDND skip logic inside the page and returns a short
 * description of whatever element it picks.
 *
 * The skip logic is replicated rather than imported so the assertions stay
 * independent of bundling decisions in `@af/integration-testing`.
 */
async function probeSkipHoneyPot({
	page,
	x,
	y,
}: {
	page: Page;
	x: number;
	y: number;
}): Promise<TSkipProbeResult> {
	return page.evaluate(
		({ x, y }) => {
			// `document.elementsFromPoint` is restricted because direct usage is
			// not honey-pot aware. This test intentionally reaches for the
			// underlying API to mirror the PDND skip logic exactly.
			// eslint-disable-next-line no-restricted-syntax
			const stack = document.elementsFromPoint(x, y);
			const top = stack[0] ?? null;
			const second = stack[1] ?? null;
			const honeyPotAttribute = 'data-pdnd-honey-pot';
			const skip =
				top && top instanceof Element && top.hasAttribute(honeyPotAttribute) ? second : top;

			function describeElement(element: Element | null): string | null {
				if (!element) {
					return null;
				}
				if (element instanceof HTMLElement && element.dataset.testid) {
					return `testid:${element.dataset.testid}`;
				}
				if (element.id) {
					return `id:${element.id}`;
				}
				return element.tagName.toLowerCase();
			}

			return {
				skipHoneyPotDescription: describeElement(skip),
			};
		},
		{ x, y },
	);
}

test.describe('honey pot (popover)', () => {
	test('honey pot opens as a popover during a drag', async ({ page }) => {
		await page.visitExample<typeof import('../../examples/post-drop-bug-fix-simple.tsx')>(
			'pragmatic-drag-and-drop',
			'core',
			'post-drop-bug-fix-simple',
		);

		const card0 = page.locator('[data-testid="card-0"]');
		const box0 = await card0.boundingBox();
		invariant(box0);

		// Honey pot has not been mounted yet
		await expect(page.locator(honeyPotSelector)).toHaveCount(0);

		// Start a drag so the honey pot mounts
		await page.mouse.move(box0.x + 1, box0.y + 1);
		await page.mouse.down();
		await page.mouse.move(box0.x + 10, box0.y + 1);

		// The honey pot is now in the DOM
		const honeyPot = page.locator(honeyPotSelector);
		await expect(honeyPot).toHaveCount(1);

		// The honey pot uses the popover API in every browser AFM runs
		// integration tests on (Chromium, Firefox, WebKit all support it).
		// If popover support is ever dropped we will need to revisit this test.
		await expect(honeyPot).toHaveAttribute('popover', 'manual');
		const isOpen = await honeyPot.evaluate((element) => element.matches(':popover-open'));
		expect(isOpen).toBe(true);

		// Drop to end the drag
		await page.mouse.up();
	});

	test('skip-honey-pot logic never returns the honey pot itself', async ({ page }) => {
		await page.visitExample<typeof import('../../examples/post-drop-bug-fix-simple.tsx')>(
			'pragmatic-drag-and-drop',
			'core',
			'post-drop-bug-fix-simple',
		);

		const card0 = page.locator('[data-testid="card-0"]');
		const box0 = await card0.boundingBox();
		invariant(box0);

		// Start a drag so the honey pot mounts
		await page.mouse.move(box0.x + 1, box0.y + 1);
		await page.mouse.down();
		await page.mouse.move(box0.x + 10, box0.y + 1);

		await expect(page.locator(honeyPotSelector)).toHaveCount(1);

		// Whatever the engine reports for the top-layer popover in
		// `elementsFromPoint`, the PDND skip logic must return a real
		// underlying element and never the honey pot itself.
		const probe = await probeSkipHoneyPot({ page, x: box0.x + 10, y: box0.y + 1 });
		expect(probe.skipHoneyPotDescription).not.toBeNull();
		expect(probe.skipHoneyPotDescription).not.toMatch(/honey-pot/);

		// Drop to end the drag
		await page.mouse.up();
	});

	test('honey pot does not leak top-layer styling after the drag finishes', async ({ page }) => {
		await page.visitExample<typeof import('../../examples/post-drop-bug-fix-simple.tsx')>(
			'pragmatic-drag-and-drop',
			'core',
			'post-drop-bug-fix-simple',
		);

		const card0 = page.locator('[data-testid="card-0"]');
		const card1 = page.locator('[data-testid="card-1"]');
		const box0 = await card0.boundingBox();
		const box1 = await card1.boundingBox();
		invariant(box0);
		invariant(box1);

		await page.mouse.move(box0.x + 1, box0.y + 1);
		await page.mouse.down();
		await page.mouse.move(box0.x + 10, box0.y + 1);
		await page.mouse.move(box1.x + 1, box1.y + 1);
		await page.mouse.up();

		// After the drop, the honey pot is removed (or scheduled for removal on
		// the next pointer interaction). A small interaction should clear it.
		await page.mouse.move(box1.x + 50, box1.y + 50);
		await page.mouse.down();
		await page.mouse.up();

		await expect(page.locator(honeyPotSelector)).toHaveCount(0);
	});
});
