import type {
  AllDragTypes,
  Input,
} from '@atlaskit/pragmatic-drag-and-drop/types';

import {
  ElementAutoScrollArgs,
  ElementGetFeedbackArgs,
  EngagementHistoryEntry,
  InternalConfig,
  WindowAutoScrollArgs,
} from '../internal-types';
import { getInternalConfig } from '../shared/configuration';
import { markAndGetEngagement } from '../shared/engagement-history';

import { selector } from './data-attributes';
import { getScrollBy } from './get-scroll-by';

type AvailableScrollDirection = { top: boolean; left: boolean };

function isScrollingAvailable(value: AvailableScrollDirection): boolean {
  return Boolean(value.top || value.left);
}

function tryScrollElements<DragType extends AllDragTypes>({
  target,
  input,
  source,
  findEntry,
  timeSinceLastFrame,
  available = { top: true, left: true },
}: {
  target: Element | null;
  input: Input;
  source: DragType['payload'];
  timeSinceLastFrame: number;
  findEntry: (element: Element) => ElementAutoScrollArgs<DragType> | null;
  available?: AvailableScrollDirection;
}): AvailableScrollDirection {
  // we cannot do any more scrolling
  if (!isScrollingAvailable(available)) {
    return available;
  }

  // run out of parents to search
  if (!target) {
    return available;
  }

  const element = target.closest(selector);

  // cannot find any more scroll containers
  if (!element) {
    return available;
  }

  const container = findEntry(element);

  // cannot find registration, this is bad.
  // fail and just exit
  if (!container) {
    return available;
  }

  function continueSearchUp() {
    return tryScrollElements({
      target: element?.parentElement ?? null,
      findEntry,
      source,
      timeSinceLastFrame,
      input,
      available,
    });
  }

  const feedback: ElementGetFeedbackArgs<DragType> = {
    input,
    source,
    element,
  };

  // Engagement is not marked if scrolling is explicitly not allowed
  if (container.canScroll && !container.canScroll(feedback)) {
    return continueSearchUp();
  }

  // Marking engagement even if no edges are scrollable.
  // We are marking engagement as soon as the element is scrolled over
  const engagement = markAndGetEngagement(element);

  const config: InternalConfig = getInternalConfig(
    container.getConfiguration?.(feedback),
  );

  const scrollBy = getScrollBy({
    element,
    engagement,
    input,
    timeSinceLastFrame,
    config,
  });

  // Only allow scrolling in directions that have not already been used
  const scroll = { top: 0, left: 0 };

  if (available.top && scrollBy.top !== 0) {
    scroll.top = scrollBy.top;
    // can no longer scroll on the top after this
    available.top = false;
  }

  if (available.left && scrollBy.left !== 0) {
    scroll.left = scrollBy.left;
    // can no longer scroll on the left after this
    available.left = false;
  }

  // Only scroll if there is something to scroll
  if (scroll.top !== 0 || scroll.left !== 0) {
    element.scrollBy(scroll);
  }

  return continueSearchUp();
}

function tryScrollWindow<DragType extends AllDragTypes>({
  input,
  timeSinceLastFrame,
  available,
  source,
  entries,
}: {
  input: Input;
  timeSinceLastFrame: number;
  available: AvailableScrollDirection;
  source: DragType['payload'];
  entries: WindowAutoScrollArgs<DragType>[];
}): void {
  const element = document.documentElement;

  const feedback: ElementGetFeedbackArgs<DragType> = {
    input,
    source,
    element,
  };

  for (const entry of entries) {
    // this entry is not allowing scrolling, we need to look for another
    if (entry.canScroll && !entry.canScroll(feedback)) {
      continue;
    }

    // Note: if we had an event for when the user is leaving a tab
    // we _could_ conceptually reset the engagement
    const engagement: EngagementHistoryEntry = markAndGetEngagement(element);

    const config: InternalConfig = getInternalConfig(
      entry.getConfiguration?.(feedback),
    );

    const scrollBy = getScrollBy({
      element,
      engagement,
      input,
      config,
      getRect: (element: Element) =>
        DOMRect.fromRect({
          y: 0,
          x: 0,
          width: element.clientWidth,
          height: element.clientHeight,
        }),
      timeSinceLastFrame,
    });

    const scroll = {
      top: available.top ? scrollBy.top : 0,
      left: available.left ? scrollBy.left : 0,
    };

    // only trigger a scroll if we are actually scrolling
    if (scroll.top !== 0 || scroll.left !== 0) {
      element.scrollBy(scroll);
    }

    // We only want the window to scroll once
    break;
  }
}

export function tryScroll<DragType extends AllDragTypes>({
  input,
  findEntry,
  timeSinceLastFrame,
  source,
  getWindowScrollEntries,
  underUsersPointer,
}: {
  input: Input;
  timeSinceLastFrame: number;
  source: DragType['payload'];
  findEntry: (element: Element) => ElementAutoScrollArgs<DragType> | null;
  getWindowScrollEntries: () => WindowAutoScrollArgs<DragType>[];
  underUsersPointer: Element | null;
}): void {
  // We are matching browser behaviour and scrolling inner elements
  // before outer ones. So we try to scroll scroller containers before
  // the window.
  const remainder: AvailableScrollDirection = tryScrollElements({
    target: underUsersPointer,
    timeSinceLastFrame,
    input,
    source,
    findEntry,
  });

  // Check if we can do any window scrolling
  if (!isScrollingAvailable(remainder)) {
    return;
  }

  tryScrollWindow({
    input,
    source,
    entries: getWindowScrollEntries(),
    timeSinceLastFrame,
    available: remainder,
  });
}
