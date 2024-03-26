import invariant from 'tiny-invariant';

import { expect, Locator, test } from '@af/integration-testing';

async function getScrollTop(locator: Locator) {
  return await locator.evaluate(element => element.scrollTop);
}

test.describe('scrollJustEnoughIntoView', () => {
  const containerSelector = '[data-testid="container"]';
  const secondCardSelector = `[data-testid="card-1"]`;

  test('should scroll a partially hidden element into full visibility', async ({
    page,
    browserName,
  }) => {
    await page.visitExample(
      'pragmatic-drag-and-drop',
      'core',
      'scroll-just-enough-into-view',
    );

    const scrollContainer = page.locator(containerSelector);
    // this card begins partially obscured
    const secondCard = page.locator(secondCardSelector);
    await expect(await getScrollTop(scrollContainer)).toBe(0);

    await await expect(secondCard).toHaveAttribute('data-state', 'idle');

    const box = await secondCard.boundingBox();
    invariant(box);

    // Note: this hover causes a scroll in Firefox :(
    await secondCard.hover({
      position: { x: 1, y: 1 },
      // using `force` to avoid built in scrolling by playwright to
      // make the element visible
      // eslint-disable-next-line playwright/no-force-option
      force: true,
    });

    await page.mouse.down();

    // checking the drag hasn't started yet
    await await expect(secondCard).toHaveAttribute('data-state', 'idle');
    // eslint-disable-next-line playwright/no-conditional-in-test
    if (browserName !== 'firefox') {
      await expect(await getScrollTop(scrollContainer)).toBe(0);
    }

    // move a bit to trigger a drag to start
    await secondCard.hover({
      // using `force` to avoid built in scrolling by playwright to
      // make the element visible
      // eslint-disable-next-line playwright/no-force-option
      force: true,
    });

    await await expect(secondCard).toHaveAttribute('data-state', 'dragging');

    // After the drag the container should have scrolled.
    await expect(await getScrollTop(scrollContainer)).toBeGreaterThan(0);

    // finish the drag
    await page.mouse.up();
    await await expect(secondCard).toHaveAttribute('data-state', 'idle');
  });

  test('should not scroll if the element is already fully visible', async ({
    page,
  }) => {
    await page.visitExample(
      'pragmatic-drag-and-drop',
      'core',
      'scroll-just-enough-into-view',
    );

    const scrollContainer = page.locator(containerSelector);
    const secondCard = page.locator(secondCardSelector);

    /**
     * Begin by scrolling the second card fully into view.
     */
    await secondCard.evaluate(element => {
      element.scrollIntoView({ block: 'nearest' });
    });
    const initialScrollTop = await getScrollTop(scrollContainer);

    expect(initialScrollTop).toBeGreaterThan(0);

    await await expect(secondCard).toHaveAttribute('data-state', 'idle');

    const box = await secondCard.boundingBox();
    invariant(box);
    await secondCard.hover({
      position: { x: 1, y: 1 },
      // using `force` to avoid built in scrolling by playwright to
      // make the element visible
      // eslint-disable-next-line playwright/no-force-option
      force: true,
    });
    await page.mouse.down();

    // move a bit to trigger a drag to start
    await secondCard.hover({
      // using `force` to avoid built in scrolling by playwright to
      // make the element visible
      // eslint-disable-next-line playwright/no-force-option
      force: true,
    });

    await await expect(secondCard).toHaveAttribute('data-state', 'dragging');

    // no scroll change required
    await expect(await getScrollTop(scrollContainer)).toBe(initialScrollTop);

    // finish the drag
    await page.mouse.up();
    await await expect(secondCard).toHaveAttribute('data-state', 'idle');
  });
});
