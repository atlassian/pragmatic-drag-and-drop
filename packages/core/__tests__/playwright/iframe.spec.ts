import invariant from 'tiny-invariant';

import { BROWSERS, expect, fixTest, type Locator, type Page, test } from '@af/integration-testing';

function center(box: { x: number; y: number; height: number; width: number }): {
	x: number;
	y: number;
} {
	return {
		x: box.x + box.width / 2,
		y: box.y + box.height / 2,
	};
}

/**
 * When dragging into and out of iframes, it is important for the sequencing of events
 * the the drag operation be closer to what a user would do.
 *
 * If we don't do this approach, then the drag won't exit the current document as the user
 * will always be over the honey pot element (in the current document)
 *
 * Locator.dragTo does this roughly:
 * - mouse.down
 * - mouse.move(destination)
 * - mouse.up
 *
 * The huge second mouse.move is problematic as it means that the honey pot will be created exactly
 * where the user will drop, and preventing the drag from leaving the current document
 */
async function realisticDragTo({ page, start, end }: { page: Page; start: Locator; end: Locator }) {
	// step 1: move mouse into the right spot
	const startBox = await start.boundingBox();
	invariant(startBox);
	const centerOfStart = center(startBox);
	await page.mouse.move(centerOfStart.x, centerOfStart.y);

	// step 2: start a drag
	await page.mouse.down();
	await page.mouse.move(centerOfStart.x + 20, centerOfStart.y);

	// step 3: move to the right spot
	const endBox = await end.boundingBox();
	invariant(endBox);
	const centerOfEnd = center(endBox);
	await page.mouse.move(centerOfEnd.x, centerOfEnd.y, { steps: 10 });

	await page.mouse.up();
}

async function setup({ page }: { page: Page }) {
	await page.visitExample('pragmatic-drag-and-drop', 'core', 'iframe');

	const dropTargetInParent = page.locator('[data-testid="drop-target-in-parent"]');
	const draggableInParent = page.locator('[data-testid="draggable-in-parent"]');

	const iframe = page.frameLocator('[data-testid="child-iframe"]');

	const dropTargetInIframe = iframe.locator('[data-testid="drop-target-in-iframe"]');
	const draggableInIframe = iframe.locator('[data-testid="draggable-in-iframe"]');

	const locators = {
		dropTargetInParent,
		draggableInParent,
		dropTargetInIframe,
		draggableInIframe,
	};

	// wait for everything to be ready before starting
	await Promise.all(
		Object.values(locators).map((locator) =>
			locator.waitFor({
				state: 'visible',
				// adding a long timeout for CI,
				// as the iframe can take longer to load in CI
				timeout: 90 * 1000,
			}),
		),
	);

	// asserting there is no drag data yet
	await expect(dropTargetInParent).toContainText('Latest drop data: none');
	await expect(dropTargetInIframe).toContainText('Latest drop data: none');

	return locators;
}

test.describe('iframes', () => {
	test('parent → iframe', async ({ page }) => {
		// Dragging from parent → iframe works correctly with pdnd in Firefox@122.
		// However, there is a bug with Playwright where `.dragTo()` does not
		// publish drag events when dragging from parent → iframe
		// https://github.com/microsoft/playwright/issues/29278
		fixTest({
			jiraIssueId: 'TBD',
			reason: 'Playwright bug when dragging from parent → iframe',
			browsers: [BROWSERS.firefox],
		});

		const { dropTargetInParent, dropTargetInIframe, draggableInParent } = await setup({ page });

		await realisticDragTo({ page, start: draggableInParent, end: dropTargetInIframe });

		await expect(dropTargetInParent).toContainText(
			'Latest drop data: none',
			// Adding longer timeout for CI
			{ timeout: 60 * 1000 },
		);
		await expect(dropTargetInIframe).toContainText(
			'Latest drop data: Drag from parent: 0',
			// Adding longer timeout for CI
			{ timeout: 60 * 1000 },
		);
	});

	test('iframe → parent', async ({ page }) => {
		const { dropTargetInParent, dropTargetInIframe, draggableInIframe } = await setup({ page });

		await realisticDragTo({ page, start: draggableInIframe, end: dropTargetInParent });

		await expect(dropTargetInIframe).toContainText(
			'Latest drop data: none',
			// Adding longer timeout for CI
			{ timeout: 60 * 1000 },
		);
		await expect(dropTargetInParent).toContainText(
			'Latest drop data: Drag from iframe: 0',
			// Adding longer timeout for CI
			{ timeout: 60 * 1000 },
		);
	});

	test('parent → iframe (multiple operations)', async ({ page }) => {
		// Dragging from parent → iframe works correctly with pdnd in Firefox@122.
		// However, there is a bug with Playwright where `.dragTo()` does not
		// publish drag events when dragging from parent → iframe
		// https://github.com/microsoft/playwright/issues/29278
		fixTest({
			jiraIssueId: 'TBD',
			reason: 'Playwright bug when dragging from parent → iframe',
			browsers: [BROWSERS.firefox],
		});

		const { dropTargetInParent, dropTargetInIframe, draggableInParent } = await setup({ page });

		// doing a few operations
		for (let i = 0; i < 5; i++) {
			await realisticDragTo({ page, start: draggableInParent, end: dropTargetInIframe });

			await expect(dropTargetInIframe).toContainText(
				`Latest drop data: Drag from parent: ${i}`,
				// Adding longer timeout for CI
				{ timeout: 60 * 1000 },
			);
			await expect(dropTargetInParent).toContainText(
				'Latest drop data: none',
				// Adding longer timeout for CI
				{ timeout: 60 * 1000 },
			);
		}
	});

	test('iframe → parent (multiple operations)', async ({ page }) => {
		const { dropTargetInParent, dropTargetInIframe, draggableInIframe } = await setup({ page });

		// doing a few operations
		for (let i = 0; i < 5; i++) {
			await realisticDragTo({ page, start: draggableInIframe, end: dropTargetInParent });

			await expect(dropTargetInParent).toContainText(
				`Latest drop data: Drag from iframe: ${i}`,
				// Adding longer timeout for CI
				{ timeout: 60 * 1000 },
			);
			await expect(dropTargetInIframe).toContainText(
				'Latest drop data: none',
				// Adding longer timeout for CI
				{ timeout: 60 * 1000 },
			);
		}
	});

	// this previously triggered a bug with our post drop fix in the iframe
	test('iframe → parent, then parent → iframe', async ({ page }) => {
		// Dragging from parent → iframe works correctly with pdnd in Firefox@122.
		// However, there is a bug with Playwright where `.dragTo()` does not
		// publish drag events when dragging from parent → iframe
		// https://github.com/microsoft/playwright/issues/29278
		fixTest({
			jiraIssueId: 'TBD',
			reason: 'Playwright bug when dragging from parent → iframe',
			browsers: [BROWSERS.firefox],
		});

		const { dropTargetInParent, dropTargetInIframe, draggableInIframe, draggableInParent } =
			await setup({ page });

		// iframe → parent
		await realisticDragTo({ page, start: draggableInIframe, end: dropTargetInParent });

		await expect(dropTargetInParent).toContainText(
			'Latest drop data: Drag from iframe: 0',
			// Adding longer timeout for CI
			{ timeout: 60 * 1000 },
		);
		await expect(dropTargetInIframe).toContainText(
			'Latest drop data: none',
			// Adding longer timeout for CI
			{ timeout: 60 * 1000 },
		);

		// parent → iframe
		await realisticDragTo({ page, start: draggableInParent, end: dropTargetInIframe });

		await expect(dropTargetInParent).toContainText(
			'Latest drop data: Drag from iframe: 0',
			// Adding longer timeout for CI
			{ timeout: 60 * 1000 },
		);
		await expect(dropTargetInIframe).toContainText(
			'Latest drop data: Drag from parent: 0',
			// Adding longer timeout for CI
			{ timeout: 60 * 1000 },
		);
	});

	test('parent → iframe, then iframe → parent', async ({ page }) => {
		// Dragging from parent → iframe works correctly with pdnd in Firefox@122.
		// However, there is a bug with Playwright where `.dragTo()` does not
		// publish drag events when dragging from parent → iframe
		// https://github.com/microsoft/playwright/issues/29278
		fixTest({
			jiraIssueId: 'TBD',
			reason: 'Playwright bug when dragging from parent → iframe',
			browsers: [BROWSERS.firefox],
		});

		const { dropTargetInParent, dropTargetInIframe, draggableInIframe, draggableInParent } =
			await setup({ page });

		// parent → iframe
		await realisticDragTo({ page, start: draggableInParent, end: dropTargetInIframe });

		await expect(dropTargetInIframe).toContainText(
			'Latest drop data: Drag from parent: 0',
			// Adding longer timeout for CI
			{ timeout: 60 * 1000 },
		);
		await expect(dropTargetInParent).toContainText(
			'Latest drop data: none',
			// Adding longer timeout for CI
			{ timeout: 60 * 1000 },
		);

		// iframe → parent
		await realisticDragTo({ page, start: draggableInIframe, end: dropTargetInParent });

		await expect(dropTargetInIframe).toContainText(
			'Latest drop data: Drag from parent: 0',
			// Adding longer timeout for CI
			{ timeout: 60 * 1000 },
		);
		await expect(dropTargetInParent).toContainText(
			'Latest drop data: Drag from iframe: 0',
			// Adding longer timeout for CI
			{ timeout: 60 * 1000 },
		);
	});

	test('should capture and report a11y violations', async ({ page }) => {
		const { dropTargetInIframe, draggableInParent } = await setup({ page });
		await realisticDragTo({ page, start: draggableInParent, end: dropTargetInIframe });

		await expect(page).toBeAccessible({ violationCount: 1 });
	});
});
