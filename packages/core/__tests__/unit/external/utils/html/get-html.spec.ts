import invariant from 'tiny-invariant';

import { combine } from '../../../../../src/entry-point/combine';
import {
  dropTargetForExternal,
  type ExternalEventBasePayload,
  monitorForExternal,
} from '../../../../../src/entry-point/external/adapter';
import { getHTML } from '../../../../../src/entry-point/external/html';
import {
  appendToBody,
  getBubbleOrderedTree,
  nativeDrag,
  reset,
} from '../../../_util';

afterEach(reset);

test('when dragging no html, getHTML() should return null', () => {
  const [A] = getBubbleOrderedTree();
  const ordered: string[] = [];
  const payloads: ExternalEventBasePayload[] = [];
  const cleanup = combine(
    appendToBody(A),
    dropTargetForExternal({
      element: A,
    }),
    monitorForExternal({
      onDragStart: args => {
        ordered.push('start');
        payloads.push(args);
      },
      onDrop: args => {
        ordered.push('drop');
        payloads.push(args);
      },
    }),
  );

  nativeDrag.startExternal({
    items: [{ data: 'Hello', type: 'text/plain' }],
  });

  // when starting a drag, no items are exposed
  expect(ordered).toEqual(['start']);
  expect(payloads.length).toBe(1);
  const first = payloads[0];
  invariant(first);
  expect(getHTML({ source: first.source })).toEqual(null);
  ordered.length = 0;
  payloads.length = 0;

  nativeDrag.drop({
    items: [{ data: 'Hello', type: 'text/plain' }],
  });

  expect(ordered).toEqual(['drop']);
  expect(payloads.length).toBe(1);
  const second = payloads[0];
  invariant(second);
  expect(getHTML({ source: second.source })).toEqual(null);

  cleanup();
});

test('when dragging html, getHTML() should return the html', () => {
  const [A] = getBubbleOrderedTree();
  const ordered: string[] = [];
  const payloads: ExternalEventBasePayload[] = [];
  const cleanup = combine(
    appendToBody(A),
    dropTargetForExternal({
      element: A,
    }),
    monitorForExternal({
      onDragStart: args => {
        ordered.push('start');
        payloads.push(args);
      },
      onDrop: args => {
        ordered.push('drop');
        payloads.push(args);
      },
    }),
  );

  nativeDrag.startExternal({
    items: [{ data: '<h1>hi there</h1>', type: 'text/html' }],
  });

  // when starting a drag, no items are exposed
  expect(ordered).toEqual(['start']);
  expect(payloads.length).toBe(1);
  const first = payloads[0];
  invariant(first);
  expect(getHTML({ source: first.source })).toEqual(null);
  ordered.length = 0;
  payloads.length = 0;

  nativeDrag.drop({
    items: [{ data: '<h1>hi there</h1>', type: 'text/html' }],
  });

  expect(ordered).toEqual(['drop']);
  expect(payloads.length).toBe(1);
  const second = payloads[0];
  invariant(second);
  expect(getHTML({ source: second.source })).toEqual('<h1>hi there</h1>');

  cleanup();
});

test('when dragging multiple types of native data (including html), getHTML() should only return the html', () => {
  const [A] = getBubbleOrderedTree();
  const ordered: string[] = [];
  const payloads: ExternalEventBasePayload[] = [];
  const cleanup = combine(
    appendToBody(A),
    dropTargetForExternal({
      element: A,
    }),
    monitorForExternal({
      onDragStart: args => {
        ordered.push('start');
        payloads.push(args);
      },
      onDrop: args => {
        ordered.push('drop');
        payloads.push(args);
      },
    }),
  );

  const items = [
    { data: 'Hello', type: 'text/plain' },
    { data: '<h1>Hi</h1>', type: 'text/html' },
  ];
  nativeDrag.startExternal({
    items,
  });

  // when starting a drag, no html are exposed
  expect(ordered).toEqual(['start']);
  expect(payloads.length).toBe(1);
  const first = payloads[0];
  invariant(first);
  expect(getHTML({ source: first.source })).toEqual(null);
  ordered.length = 0;
  payloads.length = 0;

  nativeDrag.drop({
    items,
  });

  expect(ordered).toEqual(['drop']);
  expect(payloads.length).toBe(1);
  const second = payloads[0];
  invariant(second);
  expect(getHTML({ source: second.source })).toEqual('<h1>Hi</h1>');

  cleanup();
});
