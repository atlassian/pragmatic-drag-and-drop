import { expect, Page, test } from '@af/integration-testing';

/**
 * The header is the draggable part of a column.
 */
function getColumnHeader(page: Page, columnId: string) {
  return page.locator(`[data-testid="column-header-${columnId}"]`);
}

function getItem(page: Page, itemId: string) {
  return page.locator(`[data-testid="item-${itemId}"]`);
}

async function getColumnOrder(page: Page): Promise<string[]> {
  // Reaching into to the column title as the whole header (`column-header-`)
  // also contains an `IconButton` which has visually hidden text
  return page
    .locator('[data-testid^="column-header-title-"]')
    .allTextContents();
}

function getCardOrder(
  page: Page,
  columnId: string,
): Promise<(string | null)[]> {
  return page
    .locator(`[data-testid^="column-${columnId}"]`)
    .locator('[data-testid^="item-"]')
    .evaluateAll(elements => elements.map(e => e.getAttribute('data-testid')));
}

test.describe('board', () => {
  test('should allow sorting columns', async ({ page }) => {
    await page.visitExample('pragmatic-drag-and-drop', 'docs', 'board');
    await page.waitForSelector('[draggable="true"]');

    const dragHandle = getColumnHeader(page, 'trello');
    const dropTarget = getColumnHeader(page, 'jira');

    expect(await getColumnOrder(page)).toEqual([
      'Confluence',
      'Jira',
      'Trello',
    ]);

    await dragHandle.dragTo(dropTarget);

    expect(await getColumnOrder(page)).toEqual([
      'Confluence',
      'Trello',
      'Jira',
    ]);
  });

  test('should allow sorting tasks in a column', async ({ page }) => {
    await page.visitExample('pragmatic-drag-and-drop', 'docs', 'board');
    await page.waitForSelector('[draggable="true"]');

    // Both ids correspond to elements in the first column
    const dragHandle = getItem(page, 'id:1');
    const dropTarget = getItem(page, 'id:5');

    const initialCardOrder = await getCardOrder(page, 'confluence');
    expect(initialCardOrder.indexOf('item-id:1')).toBe(0);
    expect(initialCardOrder.indexOf('item-id:5')).toBe(4);

    await dragHandle.dragTo(dropTarget);

    const finalCardOrder = await getCardOrder(page, 'confluence');
    expect(finalCardOrder.indexOf('item-id:1')).toBe(3);
    expect(finalCardOrder.indexOf('item-id:5')).toBe(4);
  });

  test('should allow moving tasks between columns', async ({ page }) => {
    await page.visitExample('pragmatic-drag-and-drop', 'docs', 'board');
    await page.waitForSelector('[draggable="true"]');

    // Corresponds to an element in the first column
    const dragHandle = getItem(page, 'id:5');
    // Corresponds to an element in the third column
    const dropTarget = getItem(page, 'id:23');

    const initialCardOrderFirstColumn = await getCardOrder(page, 'confluence');
    const initialCardOrderThirdColumn = await getCardOrder(page, 'trello');
    expect(initialCardOrderFirstColumn).toContain('item-id:5');
    expect(initialCardOrderThirdColumn).not.toContain('item-id:5');

    await dragHandle.dragTo(dropTarget);

    const finalCardOrderFirstColumn = await getCardOrder(page, 'confluence');
    const finalCardOrderThirdColumn = await getCardOrder(page, 'trello');
    expect(finalCardOrderFirstColumn).not.toContain('item-id:5');
    expect(finalCardOrderThirdColumn).toContain('item-id:5');
  });
});
