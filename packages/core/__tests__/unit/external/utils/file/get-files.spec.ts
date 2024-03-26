import invariant from 'tiny-invariant';

import { combine } from '../../../../../src/entry-point/combine';
import {
  dropTargetForExternal,
  ExternalEventBasePayload,
  monitorForExternal,
} from '../../../../../src/entry-point/external/adapter';
import { getFiles } from '../../../../../src/entry-point/external/file';
import {
  appendToBody,
  getBubbleOrderedTree,
  nativeDrag,
  reset,
} from '../../../_util';

afterEach(reset);

test('when dragging no files, getFiles() should return no files', () => {
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

  // when starting a drag, no files are exposed
  expect(ordered).toEqual(['start']);
  expect(payloads.length).toBe(1);
  const first = payloads[0];
  invariant(first);
  expect(getFiles({ source: first.source })).toEqual([]);
  ordered.length = 0;
  payloads.length = 0;

  nativeDrag.drop({
    items: [{ data: 'Hello', type: 'text/plain' }],
  });

  expect(ordered).toEqual(['drop']);
  expect(payloads.length).toBe(1);
  const second = payloads[0];
  invariant(second);
  expect(getFiles({ source: second.source })).toEqual([]);

  cleanup();
});

test('when dragging one file, getFiles() should return the file', () => {
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
  nativeDrag.startExternal({
    items: [file],
  });

  // when starting a drag, no files are exposed
  expect(ordered).toEqual(['start']);
  expect(payloads.length).toBe(1);
  const first = payloads[0];
  invariant(first);
  expect(getFiles({ source: first.source })).toEqual([]);
  ordered.length = 0;
  payloads.length = 0;

  nativeDrag.drop({
    items: [file],
  });

  expect(ordered).toEqual(['drop']);
  expect(payloads.length).toBe(1);
  const second = payloads[0];
  invariant(second);
  expect(getFiles({ source: second.source })).toEqual([file]);

  cleanup();
});

test('when dragging multiple files, getFiles() should return all files', () => {
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
  nativeDrag.startExternal({
    items: [file1, file2],
  });

  // when starting a drag, no files are exposed
  expect(ordered).toEqual(['start']);
  expect(payloads.length).toBe(1);
  const first = payloads[0];
  invariant(first);
  expect(getFiles({ source: first.source })).toEqual([]);
  ordered.length = 0;
  payloads.length = 0;

  nativeDrag.drop({
    items: [file1, file2],
  });

  expect(ordered).toEqual(['drop']);
  expect(payloads.length).toBe(1);
  const second = payloads[0];
  invariant(second);
  expect(getFiles({ source: second.source })).toEqual([file1, file2]);

  cleanup();
});

test('when dragging multiple types of native data (including files), getFiles() should only return the files', () => {
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
  const items = [file1, file2, { data: 'Hello', type: 'text/plain' }];
  nativeDrag.startExternal({
    items,
  });

  // when starting a drag, no files are exposed
  expect(ordered).toEqual(['start']);
  expect(payloads.length).toBe(1);
  const first = payloads[0];
  invariant(first);
  expect(getFiles({ source: first.source })).toEqual([]);
  ordered.length = 0;
  payloads.length = 0;

  nativeDrag.drop({
    items,
  });

  expect(ordered).toEqual(['drop']);
  expect(payloads.length).toBe(1);
  const second = payloads[0];
  invariant(second);
  expect(getFiles({ source: second.source })).toEqual([file1, file2]);

  cleanup();
});
