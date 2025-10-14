import invariant from 'tiny-invariant';

import { expect, type Page, test } from '@af/integration-testing';

import { indentPerLevel } from '../../examples/pieces/tree-legacy/constants';

type TScenario = {
	name: string;
	beforeEach: ({ page }: { page: Page }) => Promise<void>;
};

const scenarios: TScenario[] = [
	{
		name: 'tree',
		beforeEach: async ({ page }: { page: Page }) => {
			await page.visitExample('pragmatic-drag-and-drop', 'documentation', 'tree');
			await page.waitForSelector('[draggable="true"]');
		},
	},
	{
		name: 'tree-legacy',
		beforeEach: async ({ page }: { page: Page }) => {
			await page.visitExample('pragmatic-drag-and-drop', 'documentation', 'tree-legacy');
			await page.waitForSelector('[draggable="true"]');
		},
	},
];

scenarios.forEach((scenario) => {
	test.beforeEach(async ({ page }) => {
		await scenario.beforeEach({ page });
	});

	test.describe(`${scenario.name}`, () => {
		test('should allow a tree item to be reordered above another item', async ({ page }) => {
			const dragHandle = page.getByTestId('tree-item-1.2');
			const dropTarget = page.getByTestId('tree-item-1.1');
			await expect(dragHandle).toHaveAttribute('data-level', '1');
			await expect(dragHandle).toHaveAttribute('data-index', '1');

			const dropTargetRect = await dropTarget.boundingBox();
			invariant(dropTargetRect, 'Could not obtain bounding box from drop target');

			// drag over top quarter of drop target
			await dragHandle.dragTo(dropTarget, {
				targetPosition: { x: 1, y: dropTargetRect.height / 4 },
			});

			await expect(dragHandle).toHaveAttribute('data-level', '1');
			await expect(dragHandle).toHaveAttribute('data-index', '0');
		});

		test('should allow a tree item to be reordered below another item', async ({ page }) => {
			const dragHandle = page.getByTestId('tree-item-1.1.1');
			const dropTarget = page.getByTestId('tree-item-1.1.2');
			await expect(dragHandle).toHaveAttribute('data-level', '2');
			await expect(dragHandle).toHaveAttribute('data-index', '0');

			const dropTargetRect = await dropTarget.boundingBox();
			invariant(dropTargetRect, 'Could not obtain bounding box from drop target');

			// drag over bottom quarter of drop target
			await dragHandle.dragTo(dropTarget, {
				targetPosition: {
					x: dropTargetRect.width - 1,
					y: dropTargetRect.height - dropTargetRect.height / 4,
				},
			});

			await expect(dragHandle).toHaveAttribute('data-level', '2');
			await expect(dragHandle).toHaveAttribute('data-index', '1');
		});

		test('should allow a tree item to become a child of another tree item', async ({ page }) => {
			const dragHandle = page.getByTestId('tree-item-1.2');
			const dropTarget = page.getByTestId('tree-item-1.1');
			await expect(dragHandle).toHaveAttribute('data-level', '1');
			await expect(dragHandle).toHaveAttribute('data-index', '1');

			const dropTargetRect = await dropTarget.boundingBox();
			invariant(dropTargetRect, 'Could not obtain bounding box from drop target');

			// drag over middle of drop target
			await dragHandle.dragTo(dropTarget, {
				targetPosition: {
					x: dropTargetRect.width / 2,
					y: dropTargetRect.height / 2,
				},
			});

			await expect(dragHandle).toHaveAttribute('data-level', '2');
			await expect(dragHandle).toHaveAttribute('data-index', '0');
		});

		test('should allow a tree item to be reparented from level 2 -> level 1', async ({ page }) => {
			const dragHandle = page.getByTestId('tree-item-1.1.2');
			await expect(dragHandle).toHaveAttribute('data-level', '2');
			await expect(dragHandle).toHaveAttribute('data-index', '1');

			const dragHandleRect = await dragHandle.boundingBox();
			invariant(dragHandleRect, 'Could not obtain bounding box from drop target');

			await dragHandle.hover();
			await page.mouse.down();
			// drag item to the bottom half and left (into the space before border-box)
			await page.mouse.move(
				dragHandleRect.x + indentPerLevel,
				dragHandleRect.y + dragHandleRect.height / 2,
			);
			await page.mouse.up();

			await expect(dragHandle).toHaveAttribute('data-level', '1');
			await expect(dragHandle).toHaveAttribute('data-index', '1');
		});

		test('should allow a tree item to be reparented from level 2 -> level 0', async ({ page }) => {
			const dragHandle = page.getByTestId('tree-item-1.1.2');
			await expect(dragHandle).toHaveAttribute('data-level', '2');
			await expect(dragHandle).toHaveAttribute('data-index', '1');

			const dragHandleRect = await dragHandle.boundingBox();
			invariant(dragHandleRect, 'Could not obtain bounding box from drop target');

			await dragHandle.hover();
			await page.mouse.down();
			// drag item to the bottom half and left edge
			await page.mouse.move(dragHandleRect.x + 1, dragHandleRect.y + dragHandleRect.height / 2);
			await page.mouse.up();

			await expect(dragHandle).toHaveAttribute('data-level', '0');
			await expect(dragHandle).toHaveAttribute('data-index', '1');
		});

		test('should not allow a tree item to be made a child when the "make-child" instruction is blocked on the drop target', async ({
			page,
		}) => {
			const dragHandle = page.getByTestId('tree-item-2.1.1');
			const dropTarget = page.getByTestId('tree-item-1.1.2');
			await expect(dragHandle).toHaveAttribute('data-level', '2');
			await expect(dragHandle).toHaveAttribute('data-index', '0');

			const dropTargetRect = await dropTarget.boundingBox();
			invariant(dropTargetRect, 'Could not obtain bounding box from drop target');

			await dragHandle.dragTo(dropTarget, {
				targetPosition: {
					x: dropTargetRect.width / 2,
					y: dropTargetRect.height / 2,
				},
			});

			await expect(dragHandle).toHaveAttribute('data-level', '2');
			await expect(dragHandle).toHaveAttribute('data-index', '0');
		});

		test('should capture and report a11y violations', async ({ page }) => {
			await expect(page).toBeAccessible({ violationCount: 1 });
		});
	});
});
