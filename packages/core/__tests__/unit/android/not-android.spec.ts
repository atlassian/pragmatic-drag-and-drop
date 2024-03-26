import { bind } from 'bind-event-listener';
import invariant from 'tiny-invariant';

import { combine } from '../../../src/entry-point/combine';
import { draggable } from '../../../src/entry-point/element/adapter';
import { monitorForExternal } from '../../../src/entry-point/external/adapter';
import { getHTML } from '../../../src/public-utils/external/html';
import { androidFallbackText } from '../../../src/util/android';
import { textMediaType } from '../../../src/util/media-types/text-media-type';
import {
  appendToBody,
  getElements,
  nativeDrag,
  reset,
  userEvent,
} from '../_util';

/** Why these tests are in a separate file to `android.spec.ts`?
 * - our `isAndroid()` result is cached, so we need to reset it's cache
 * - using `jest.isolateModules(fn)` requires using `require()`
 * - `require()` in our repo (right now) makes all the types `any`
 */

afterEach(reset);

it('should not add a fake "text/plain" entry', () => {
  const [element] = getElements('div');
  const ordered: string[] = [];
  let transfer: DataTransfer = new DataTransfer();

  const cleanup = combine(
    appendToBody(element),
    draggable({
      element,
      onGenerateDragPreview: () => ordered.push('draggable:preview'),
      onDragStart: () => ordered.push('draggable:start'),
    }),
    bind(window, {
      type: 'dragstart',
      listener(event) {
        invariant(event.dataTransfer);
        ordered.push('native:start');
        transfer = event.dataTransfer;
      },
      // want to come in after the element adapter
      options: { capture: false },
    }),
  );

  userEvent.lift(element);

  expect(ordered).toEqual([
    'draggable:preview',
    'native:start',
    'draggable:start',
  ]);
  invariant(transfer);

  expect(transfer.types).toEqual(['application/vnd.pdnd']);
  expect(transfer.getData('text/plain')).toEqual('');

  cleanup();
});

it('should not expose a "text/plain" type (or item) to the external adapter if the data is the fake android data', () => {
  const [element] = getElements('div');
  const ordered: string[] = [];

  const cleanup = combine(
    appendToBody(element),
    monitorForExternal({
      onDragStart: ({ source }) => {
        ordered.push('monitor:start');
        // Android fallback is removed, and we only get html
        expect(source.types).toEqual(['text/html']);

        // items not exposed until drop
        expect(source.items).toEqual([]);
      },
      onDrop({ source }) {
        ordered.push('monitor:drop');

        // Android fallback is removed, and we only get html
        expect(source.types).toEqual(['text/html']);
        // item not exposed
        expect(source.items.length).toBe(1);
        // data not exposed
        expect(source.getStringData('text/plain')).toBe(null);

        expect(getHTML({ source: source })).toBe('<strong>Hello</strong>');
      },
    }),
  );

  nativeDrag.startExternal({
    items: [
      { type: textMediaType, data: androidFallbackText },
      { type: 'text/html', data: '<strong>Hello</strong>' },
    ],
  });

  expect(ordered).toEqual(['monitor:start']);
  ordered.length = 0;

  nativeDrag.drop({
    items: [
      { type: textMediaType, data: androidFallbackText },
      { type: 'text/html', data: '<strong>Hello</strong>' },
    ],
  });

  expect(ordered).toEqual(['monitor:drop']);

  cleanup();
});
