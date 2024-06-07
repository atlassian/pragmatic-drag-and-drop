import { BROWSERS, expect, fixTest, type Page, test } from '@af/integration-testing';

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

		await draggableInParent.dragTo(dropTargetInIframe);

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

		await draggableInIframe.dragTo(dropTargetInParent);

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
			await draggableInParent.dragTo(dropTargetInIframe);

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
			await draggableInIframe.dragTo(dropTargetInParent);

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
		await draggableInIframe.dragTo(dropTargetInParent);

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
		await draggableInParent.dragTo(
			dropTargetInIframe,
			// We need to bypass the actionability check
			// as the `dropTargetInIframe` will still have the
			// post drag fix applied from the last drag operation
			// from the iframe
			// eslint-disable-next-line playwright/no-force-option
			{ force: true },
		);

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
		await draggableInParent.dragTo(dropTargetInIframe);

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
		await draggableInIframe.dragTo(
			dropTargetInParent,
			// We need to bypass the actionability check
			// as the `dropTargetInParent` will still have the
			// post drag fix applied from the last drag operation
			// from the parent
			// eslint-disable-next-line playwright/no-force-option
			{ force: true },
		);

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
});
