import invariant from 'tiny-invariant';

import { combine } from '../../../../../src/entry-point/combine';
import {
  dropTargetForExternal,
  type ExternalEventBasePayload,
  monitorForExternal,
} from '../../../../../src/entry-point/external/adapter';
import { containsFiles } from '../../../../../src/entry-point/external/file';
import {
  appendToBody,
  getBubbleOrderedTree,
  nativeDrag,
  reset,
} from '../../../_util';

afterEach(reset);

test('when dragging no files, containFiles() should return false', () => {
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

  nativeDrag.startExternal({ items: [{ data: 'Hello', type: 'text/plain' }] });

  expect(ordered).toEqual(['start']);
  expect(payloads.length).toBe(1);
  const first = payloads[0];
  invariant(first);
  expect(containsFiles(first)).toBe(false);
  ordered.length = 0;
  payloads.length = 0;

  // Okay, now let's drop
  nativeDrag.drop({ items: [{ data: 'Hello', type: 'text/plain' }] });

  expect(ordered).toEqual(['drop']);
  expect(payloads.length).toBe(1);
  const second = payloads[0];
  invariant(second);
  expect(containsFiles(second)).toBe(false);

  cleanup();
});

test('when dragging one file, containFiles() should return true', () => {
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

  const file: File = new File(['🕺'], 'dance.png', {
    type: 'image/png',
  });
  nativeDrag.startExternal({ items: [file] });

  expect(ordered).toEqual(['start']);
  expect(payloads.length).toBe(1);
  const first = payloads[0];
  invariant(first);
  expect(containsFiles(first)).toBe(true);
  ordered.length = 0;
  payloads.length = 0;

  // Okay, now let's drop
  nativeDrag.drop({ items: [file] });

  expect(ordered).toEqual(['drop']);
  expect(payloads.length).toBe(1);
  const second = payloads[0];
  invariant(second);
  expect(containsFiles(second)).toBe(true);

  cleanup();
});

test('when dragging multiple files, containFiles() should return true', () => {
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
  const file1: File = new File(['1'], '1.png', {
    type: 'image/png',
  });
  const file2: File = new File(['2'], '2.png', {
    type: 'image/png',
  });
  nativeDrag.startExternal({ items: [file1, file2] });

  expect(ordered).toEqual(['start']);
  expect(payloads.length).toBe(1);
  const first = payloads[0];
  invariant(first);
  expect(containsFiles(first)).toBe(true);
  ordered.length = 0;
  payloads.length = 0;

  // Okay, now lets drop

  nativeDrag.drop({ items: [file1, file2] });

  expect(ordered).toEqual(['drop']);
  expect(payloads.length).toBe(1);
  const second = payloads[0];
  invariant(second);
  expect(containsFiles(second)).toBe(true);

  cleanup();
});

test('when dragging multiple types of native data (including files), containFiles() should return true', () => {
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

  const file: File = new File(['🕺'], 'dance.png', {
    type: 'image/png',
  });
  const items = [file, { data: 'Hello', type: 'text/plain' }];
  nativeDrag.startExternal({
    items,
  });

  expect(ordered).toEqual(['start']);
  expect(payloads.length).toBe(1);
  const first = payloads[0];
  invariant(first);
  expect(containsFiles(first)).toBe(true);
  ordered.length = 0;
  payloads.length = 0;

  // Okay, now lets drop

  nativeDrag.drop({ items });

  expect(ordered).toEqual(['drop']);
  expect(payloads.length).toBe(1);
  const second = payloads[0];
  invariant(second);
  expect(containsFiles(second)).toBe(true);

  cleanup();
});
