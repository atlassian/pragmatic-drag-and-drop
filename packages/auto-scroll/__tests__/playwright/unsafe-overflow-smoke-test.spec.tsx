import invariant from 'tiny-invariant';

import { expect, test } from '@af/integration-testing';

test.describe('over element automatic scrolling', () => {
  test('should scroll a scrollable element forwards', async ({ page }) => {
    await page.visitExample(
      'pragmatic-drag-and-drop',
      'auto-scroll',
      'unsafe-overflow-only',
    );

    const columnTestId = 'column-0';
    const card = page.getByTestId('column-0::item-0');
    const column = page.getByTestId(columnTestId);

    // first check: ensure the column is not scrolled yet
    expect(await column.evaluate(element => element.scrollTop)).toBe(0);

    const columnRect = await column.boundingBox();
    invariant(columnRect, 'Could not obtain bounding box from column');

    await card.hover();
    await page.mouse.down();
    // Using 'move' rather than 'hover' as 'hover' also does it's own scrolling
    await page.mouse.move(
      columnRect.x + columnRect.width / 2,
      // Going below the column a bit so we know we are triggering the overflow scroller
      columnRect.y + columnRect.height + 100,
      { steps: 20 },
    );

    await page.waitForFunction(testId => {
      const element = document.querySelector(`[data-testid="${testId}"]`);
      if (!element) {
        throw new Error(`Unable to find element with test id "${testId}"`);
      }
      return element.scrollTop > 0;
    }, columnTestId);
  });
});
