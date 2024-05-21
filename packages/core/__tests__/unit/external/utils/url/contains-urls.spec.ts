import invariant from 'tiny-invariant';

import { combine } from '../../../../../src/entry-point/combine';
import {
  dropTargetForExternal,
  type ExternalEventBasePayload,
  monitorForExternal,
} from '../../../../../src/entry-point/external/adapter';
import {
  containsText,
  getText,
} from '../../../../../src/entry-point/external/text';
import {
  containsURLs,
  getURLs,
} from '../../../../../src/entry-point/external/url';
import {
  appendToBody,
  getBubbleOrderedTree,
  nativeDrag,
  reset,
} from '../../../_util';

afterEach(reset);

test('when dragging no urls, containsURLs() should return false', () => {
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

  const items = [{ data: 'Hello', type: 'text/plain' }];
  nativeDrag.startExternal({
    items,
  });

  // when starting a drag, no items are exposed
  expect(ordered).toEqual(['start']);
  expect(payloads.length).toBe(1);
  const first = payloads[0];
  invariant(first);
  expect(containsURLs({ source: first.source })).toEqual(false);
  ordered.length = 0;
  payloads.length = 0;

  nativeDrag.drop({
    items,
  });

  expect(ordered).toEqual(['drop']);
  expect(payloads.length).toBe(1);
  const second = payloads[0];
  invariant(second);
  expect(containsURLs({ source: second.source })).toEqual(false);

  // checking the text is there
  expect(getText({ source: second.source })).toEqual('Hello');

  cleanup();
});

test('when dragging urls, containsURLs() should return true', () => {
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

  const items = [{ data: 'https://atlassian.design/', type: 'text/uri-list' }];
  nativeDrag.startExternal({
    items,
  });

  // when starting a drag, no items are exposed
  expect(ordered).toEqual(['start']);
  expect(payloads.length).toBe(1);
  const first = payloads[0];
  invariant(first);
  expect(containsURLs({ source: first.source })).toEqual(true);
  ordered.length = 0;
  payloads.length = 0;

  nativeDrag.drop({
    items,
  });

  expect(ordered).toEqual(['drop']);
  expect(payloads.length).toBe(1);
  const second = payloads[0];
  invariant(second);
  expect(containsURLs({ source: second.source })).toEqual(true);

  // checking the text is there
  expect(getURLs({ source: second.source })).toEqual([
    'https://atlassian.design/',
  ]);

  cleanup();
});

test('when dragging multiple types of native data (including urls), containsURLs() should return true', () => {
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
    { data: 'https://atlassian.design/', type: 'text/uri-list' },
    { data: 'Hello', type: 'text/plain' },
  ];
  nativeDrag.startExternal({
    items,
  });

  // when starting a drag, no items are exposed
  expect(ordered).toEqual(['start']);
  expect(payloads.length).toBe(1);
  const first = payloads[0];
  invariant(first);
  expect(containsURLs({ source: first.source })).toEqual(true);
  ordered.length = 0;
  payloads.length = 0;

  nativeDrag.drop({
    items,
  });

  expect(ordered).toEqual(['drop']);
  expect(payloads.length).toBe(1);
  const second = payloads[0];
  invariant(second);
  expect(containsURLs({ source: second.source })).toEqual(true);

  // checking url is there
  expect(getURLs({ source: second.source })).toEqual([
    'https://atlassian.design/',
  ]);
  // checking our text is there
  expect(containsText({ source: second.source })).toEqual(true);

  cleanup();
});
