import { expect, test } from '@af/integration-testing';

test.describe('stickiness', () => {
	test('should hold on to the previous item and list container drop targets when drag moves outside of any drop target', async ({
		page,
	}) => {
		await page.visitExample('pragmatic-drag-and-drop', 'core', 'stickiness');
		await page.waitForSelector('[draggable="true"]');

		const dragHandle = page.getByTestId('list-item-2');
		const dropTarget = page.getByTestId('list-item-5');

		// start the drag
		await dragHandle.hover({ position: { x: 1, y: 1 } });
		await page.mouse.down();

		// Explicitly starting the drag like this is needed for firefox
		await dragHandle.hover({ position: { x: 10, y: 0 } });

		// move over drop target
		await dropTarget.hover();

		// Expect both list item and list container are marked as being dragged over
		const listItemDragIndicator = page.getByTestId('list-item-5.drag-indicator');
		await expect(listItemDragIndicator).toHaveAttribute('data-is-dragged-over', 'true');

		const listContainer = page.getByTestId('list-container');
		await expect(listContainer).toHaveAttribute('data-is-dragged-over', 'true');

		// Move mouse onto the adjacent element that, so it is no longer over any drop targets.
		await page.getByTestId('element-without-drop-target').hover();

		// Both list item and list container should still be marked as being dragged over
		await expect(listItemDragIndicator).toHaveAttribute('data-is-dragged-over', 'true');
		await expect(listContainer).toHaveAttribute('data-is-dragged-over', 'true');
	});
});
