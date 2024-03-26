// Note: not using '@testing-library/dom' in this file as it can
// add it's own "error" event listeners when other events are being fired
// This file uses vanilla event firing so that we are in total control

import { combine } from '../../../../src/entry-point/combine';
import {
  appendToBody,
  getElements,
  nativeDrag,
  reset,
  userEvent,
} from '../../_util';

let addEventListener = jest.spyOn(window, 'addEventListener');
let removeEventListener = jest.spyOn(window, 'removeEventListener');

jest.resetModules();

afterEach(() => {
  addEventListener.mockClear();
  removeEventListener.mockClear();
  jest.resetModules();
});

afterEach(reset);

const moduleAddListenerCount = 2;

it('should bind event listeners ready for external drags when the module is imported', () => {
  expect(addEventListener).not.toHaveBeenCalled();
  require('../../../../src/entry-point/external/adapter');

  // initial listeners
  expect(addEventListener).toHaveBeenCalledTimes(moduleAddListenerCount);
});

it('should not add more event listeners drop targets or monitors are added', () => {
  expect(addEventListener).not.toHaveBeenCalled();
  const {
    dropTargetForExternal,
    monitorForExternal,
  } = require('../../../../src/entry-point/external/adapter');

  expect(addEventListener).toHaveBeenCalledTimes(moduleAddListenerCount);

  const [A] = getElements('div');
  const unbind = combine(
    appendToBody(A),
    dropTargetForExternal({
      element: A,
    }),
    monitorForExternal({}),
  );

  expect(addEventListener).toHaveBeenCalledTimes(moduleAddListenerCount);
  unbind();
});

it('should bind event listeners needed for the drag only while dragging', () => {
  const {
    dropTargetForExternal,
    monitorForExternal,
  } = require('../../../../src/entry-point/external/adapter');
  const ordered: string[] = [];

  // no event listeners added or removed yet
  expect(addEventListener).toHaveBeenCalledTimes(moduleAddListenerCount);
  expect(removeEventListener).not.toHaveBeenCalled();

  const [A] = getElements('div');
  const unbindA = combine(
    appendToBody(A),
    dropTargetForExternal({
      element: A,
    }),
    monitorForExternal({
      onDragStart: () => ordered.push('start'),
      onDrop: () => ordered.push('drop'),
    }),
  );

  expect(addEventListener).toHaveBeenCalledTimes(moduleAddListenerCount);
  // Note: Cannot reset the mock. It causes internal reference mismatches
  // addEventListener.mockReset();

  // let's start a drag
  nativeDrag.startExternal({
    items: [{ data: 'Hi there', type: 'text/plain' }],
  });
  expect(ordered).toEqual(['start']);
  ordered.length = 0;

  // we expect that *new* event listeners have been added for the duration of a the drag
  const postLiftAddEventListenerCount =
    addEventListener.mock.calls.length - moduleAddListenerCount;
  expect(postLiftAddEventListenerCount).toBeGreaterThan(0);
  expect(removeEventListener).not.toHaveBeenCalled();

  // finish the drag
  window.dispatchEvent(
    new DragEvent('dragend', { cancelable: true, bubbles: true }),
  );

  expect(ordered).toEqual(['drop']);

  // all new event listeners have been removed
  expect(removeEventListener).toHaveBeenCalledTimes(
    postLiftAddEventListenerCount,
  );
  // no more event listeners added
  expect(addEventListener).toHaveBeenCalledTimes(
    postLiftAddEventListenerCount + moduleAddListenerCount,
  );

  unbindA();
});

it('should keep dragging event listeners bound even if only drop target is removed mid drag', () => {
  const {
    dropTargetForExternal,
    monitorForExternal,
  } = require('../../../../src/entry-point/external/adapter');
  const ordered: string[] = [];

  // no event listeners added or removed yet
  expect(addEventListener).toHaveBeenCalledTimes(moduleAddListenerCount);
  expect(removeEventListener).not.toHaveBeenCalled();

  const [A] = getElements('div');
  const unbindA = combine(
    appendToBody(A),
    dropTargetForExternal({
      element: A,
      onDrop: () => ordered.push('draggable:drop'),
    }),
  );
  const unbindMonitor = monitorForExternal({
    onDragStart: () => ordered.push('monitor:start'),
    onDrop: () => ordered.push('monitor:drop'),
  });

  expect(addEventListener).toHaveBeenCalledTimes(moduleAddListenerCount);
  // Note: Cannot reset the mock. It causes internal reference mismatches
  // addEventListener.mockReset();

  // let's start a drag
  nativeDrag.startExternal({
    items: [{ data: 'Hi there', type: 'text/plain' }],
  });
  expect(ordered).toEqual(['monitor:start']);
  ordered.length = 0;

  // we expect that *new* event listeners have been added for the duration of a the drag
  const postLiftAddEventListenerCount =
    addEventListener.mock.calls.length - moduleAddListenerCount;
  expect(postLiftAddEventListenerCount).toBeGreaterThan(0);
  expect(removeEventListener).not.toHaveBeenCalled();

  // unbinding the only drop target mid drag
  unbindA();

  expect(removeEventListener).not.toHaveBeenCalled();

  // finish the drag
  window.dispatchEvent(
    new DragEvent('dragend', { cancelable: true, bubbles: true }),
  );

  // monitor still told about the drop
  expect(ordered).toEqual(['monitor:drop']);

  // all dragging event listeners removed
  expect(removeEventListener).toHaveBeenCalledTimes(
    postLiftAddEventListenerCount,
  );

  unbindMonitor();
});

it('should remove event listeners used to detect local drags when a location drag finishes', () => {
  const {
    monitorForExternal,
  } = require('../../../../src/entry-point/external/adapter');

  expect(addEventListener).toHaveBeenCalledTimes(moduleAddListenerCount);

  const [anchor] = getElements('a');
  anchor.href = 'https://domevents.dev';
  const ordered: string[] = [];

  const unbind = combine(
    appendToBody(anchor),
    monitorForExternal({
      onDragStart: () => ordered.push('external:start'),
    }),
  );

  nativeDrag.startInternal({
    target: anchor,
    items: [{ type: 'text/uri-list', data: 'https://domevents.dev' }],
  });

  const addedEventListenersCount =
    addEventListener.mock.calls.length - moduleAddListenerCount;
  expect(addedEventListenersCount).toBeGreaterThan(0);
  expect(removeEventListener).not.toHaveBeenCalled();

  userEvent.cancel();

  expect(removeEventListener).toHaveBeenCalledTimes(addedEventListenersCount);

  unbind();
});
