import type { JSHandle } from 'playwright-core';

import { expect, test } from '@af/integration-testing';

import { customAttributes } from '../../src/utils/attributes';

function getDraggableSelector(draggableId: string) {
  return `[data-testid="item-${draggableId}"]`;
}

test.describe('virtual lists', () => {
  test.describe('keyboard drag', () => {
    test('should not error when the draggable remounts during a drag', async ({
      page,
    }) => {
      await page.visitExample(
        'pragmatic-drag-and-drop',
        'react-beautiful-dnd-migration',
        'react-window',
      );

      /**
       * The card we are moving, and the draggable we are interested in
       * making remount during the drag.
       *
       * It begins as the first card in the list.
       */
      const card = page.locator(getDraggableSelector('A0'));

      const cardParent: JSHandle<HTMLElement | null> =
        await card.evaluateHandle((el: HTMLElement) => el.parentElement);

      await expect(card).toHaveAttribute(customAttributes.draggable.index, '0');

      await card.focus();
      await card.press('Space');

      /**
       * Move down the list until the draggable unmounts.
       *
       * NOTE: Previously this only went down 8, which seemed to land
       * around the exact threshold where `react-window` unmounts the Draggable.
       *
       * This led to flakiness, as the Draggable would unmount but then remount
       * immediately after.
       *
       * Moving to the bottom seems to result in the Draggable staying
       * consistently unmounted, so no flakiness!
       */

      // Move to the bottom of the list
      // This is to make the Draggable associated with the card unmount
      for (let i = 0; i < 9; i++) {
        await page.keyboard.press('ArrowDown');
      }

      /**
       * Wait until the Draggable has actually unmounted.
       *
       * This has also been a source of flakiness. Without this wait the
       * element is not always unmounted in time. It seems like there is an
       * async behaviour here, so we need to wait.
       */
      await page.waitForFunction(el => !el?.isConnected, cardParent);

      // Move back to the top of the list
      // This ensures the Draggable associated with `card` will remount
      for (let i = 0; i < 9; i++) {
        await page.keyboard.press('ArrowUp');
      }

      // Now drop the card one place down from where it started,
      // to verify drops are still working correctly
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Space');

      await expect(card).toHaveAttribute(customAttributes.draggable.index, '1');
    });
  });
});
