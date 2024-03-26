import { expect, test } from '@af/integration-testing';

test.describe('text selection', () => {
  test('dragging text selection', async ({ page, browserName }) => {
    /**
     * Unfortunately there is a bug with text selection dragging
     * in Playwright for Chrome and Webkit.
     * https://github.com/microsoft/playwright/issues/29466
     */
    // eslint-disable-next-line playwright/no-conditional-in-test
    if (browserName !== 'firefox') {
      return;
    }

    await page.visitExample(
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
});
