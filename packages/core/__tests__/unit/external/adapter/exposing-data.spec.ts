import { fireEvent } from '@testing-library/dom';
import { bindAll } from 'bind-event-listener';
import invariant from 'tiny-invariant';

import { combine } from '../../../../src/entry-point/combine';
import {
  dropTargetForExternal,
  type ExternalDragPayload,
  monitorForExternal,
  type NativeMediaType,
} from '../../../../src/entry-point/external/adapter';
import { getFiles } from '../../../../src/entry-point/external/file';
import { getHTML } from '../../../../src/entry-point/external/html';
import { getText } from '../../../../src/entry-point/external/text';
import { getURLs } from '../../../../src/entry-point/external/url';
import {
  addItemsToEvent,
  appendToBody,
  getBubbleOrderedTree,
  nativeDrag,
  reset,
} from '../../_util';

afterEach(reset);

function sort<Value>(array: readonly Value[]): Value[] {
  return Array.from(array).sort();
}

//  [MediaType in NativeMediaType]: MediaType extends 'Files' ? File : string;
const fakeData = {
  Files: new File(['🕺💃'], 'dance.png', {
    type: 'image/png',
  }),
  'text/plain': 'Plain text',
  'text/uri-list': 'https://atlassian.design/',
  'text/html': '<h1>hi</h1>',
};

const nativeMediaTypes: NativeMediaType[] = sort(getKeys(fakeData));

function getKeys<Obj extends Record<string, unknown>>(obj: Obj): (keyof Obj)[] {
  return Object.keys(obj);
}

function addFakeDataToEvent(event: DragEvent) {
  const items = getKeys(fakeData).map(key => {
    const item = fakeData[key];
    if (item instanceof File) {
      return item;
    }
    return { data: item, type: key };
  });
  addItemsToEvent({ event, items });
}

test('data should only be exposed during a successful drop', () => {
  const [A] = getBubbleOrderedTree();
  const ordered: string[] = [];
  // Using an array rather than `NativePayload | null` as TS was incorrectly narrowing
  // the value to `null` if it is only set inside of the pdnd callbacks
  const payloads: ExternalDragPayload[] = [];

  const cleanup = combine(
    appendToBody(A),
    dropTargetForExternal({
      element: A,
    }),
    monitorForExternal({
      onDragStart: args => {
        ordered.push(`start:external`);
        payloads.push(args.source);
      },
      onDropTargetChange: args => {
        ordered.push(`change:external`);
        payloads.push(args.source);
      },
      onDrag: args => {
        ordered.push(`drag:external`);
        payloads.push(args.source);
      },
      onDrop: args => {
        ordered.push(`drop:external`);
        payloads.push(args.source);
      },
    }),
  );

  // let's start an external drag
  {
    const event = new DragEvent('dragenter', {
      cancelable: true,
      bubbles: true,
    });
    addFakeDataToEvent(event);

    // validating setup by ensuring that native event is setup correctly
    expect(sort(event.dataTransfer?.types ?? [])).toEqual(nativeMediaTypes);
    window.dispatchEvent(event);
    // need to wait for an animation frame
    expect(ordered).toEqual([]);

    // @ts-expect-error -> flush drag start
    requestAnimationFrame.step();

    expect(ordered).toEqual(['start:external']);
    expect(payloads.length).toBe(1);
    const payload = payloads.at(-1);
    invariant(payload);
    // types are exposed
    expect(sort(payload.types)).toEqual(nativeMediaTypes);
    // items are not exposed
    expect(payload.items.length).toBe(0);
    // `getData` doesn't return values
    for (const key of getKeys(fakeData)) {
      expect(payload.getStringData(key)).toEqual(null);
    }

    ordered.length = 0;
    payloads.length = 0;
  }
  // [] => [A] (entering A)
  {
    const event = new DragEvent('dragenter', {
      cancelable: true,
      bubbles: true,
    });
    addFakeDataToEvent(event);

    // validating setup by ensuring that native event is setup correctly
    expect(sort(event.dataTransfer?.types ?? [])).toEqual(nativeMediaTypes);
    A.dispatchEvent(event);

    expect(ordered).toEqual(['change:external']);
    expect(payloads.length).toBe(1);
    const payload = payloads.at(-1);
    invariant(payload);
    // types are exposed
    expect(sort(payload.types)).toEqual(nativeMediaTypes);
    // items are not exposed
    expect(payload.items.length).toBe(0);
    // `getData` doesn't return values
    for (const key of getKeys(fakeData)) {
      expect(payload.getStringData(key)).toEqual(null);
    }

    ordered.length = 0;
    payloads.length = 0;
  }
  // [A] => [A] (moving in A)
  {
    const event = new DragEvent('dragover', {
      cancelable: true,
      bubbles: true,
    });
    addFakeDataToEvent(event);

    // validating setup by ensuring that native event is setup correctly
    expect(sort(event.dataTransfer?.types ?? [])).toEqual(nativeMediaTypes);
    A.dispatchEvent(event);

    // drag events are throttled in an animation frame
    expect(ordered).toEqual([]);

    // @ts-expect-error -> flush update
    requestAnimationFrame.step();

    expect(ordered).toEqual(['drag:external']);
    expect(payloads.length).toBe(1);
    const payload = payloads.at(-1);
    invariant(payload);
    // types are exposed
    expect(sort(payload.types)).toEqual(nativeMediaTypes);
    // items are not exposed
    expect(payload.items.length).toBe(0);
    // `getData` doesn't return values
    for (const key of getKeys(fakeData)) {
      expect(payload.getStringData(key)).toEqual(null);
    }

    ordered.length = 0;
    payloads.length = 0;
  }
  // [A] => drop
  {
    const event = new DragEvent('drop', {
      cancelable: true,
      bubbles: true,
    });
    addFakeDataToEvent(event);

    // validating setup by ensuring that native event is setup correctly
    expect(sort(event.dataTransfer?.types ?? [])).toEqual(nativeMediaTypes);
    A.dispatchEvent(event);

    expect(ordered).toEqual(['drop:external']);
    expect(payloads.length).toBe(1);
    const payload = payloads.at(-1);
    invariant(payload);
    // types are exposed
    // this also validates that the element adapter type are not exposed
    expect(sort(payload.types)).toEqual(nativeMediaTypes);
    // items are now exposed
    // this also validates that the element adapter item is not exposed
    expect(payload.items.length).toEqual(nativeMediaTypes.length);
    // `getData` now returns correct values
    for (const key of getKeys(fakeData)) {
      if (key !== 'Files') {
        expect(payload.getStringData(key)).toEqual(fakeData[key]);
      }
    }
    // checking getters are extracting the right information
    expect(getFiles({ source: payload })).toEqual([fakeData.Files]);
    expect(getText({ source: payload })).toEqual(fakeData['text/plain']);
    expect(getURLs({ source: payload })).toEqual([fakeData['text/uri-list']]);
    expect(getHTML({ source: payload })).toEqual(fakeData['text/html']);

    ordered.length = 0;
    payloads.length = 0;
  }

  cleanup();
});

test('data should not be exposed during a cancel', () => {
  const [A] = getBubbleOrderedTree();
  const ordered: string[] = [];
  // Using an array rather than `NativePayload | null` as TS was incorrectly narrowing
  // the value to `null` if it is only set inside of the pdnd callbacks
  const payloads: ExternalDragPayload[] = [];

  const cleanup = combine(
    appendToBody(A),
    dropTargetForExternal({
      element: A,
      onDragEnter: () => ordered.push('dropTarget:enter'),
      onDragLeave: () => ordered.push('dropTarget:leave'),
    }),
    monitorForExternal({
      onDragStart: args => {
        ordered.push(`start:external`);
        payloads.push(args.source);
      },
      onDropTargetChange: args => {
        ordered.push(`change:external`);
        payloads.push(args.source);
      },
      onDrag: args => {
        ordered.push(`drag:external`);
        payloads.push(args.source);
      },
      onDrop: args => {
        ordered.push(`drop:external`);
        payloads.push(args.source);
      },
    }),
  );

  // let's start an external drag
  {
    const event = new DragEvent('dragenter', {
      cancelable: true,
      bubbles: true,
    });
    addFakeDataToEvent(event);

    // validating setup by ensuring that native event is setup correctly
    expect(sort(event.dataTransfer?.types ?? [])).toEqual(nativeMediaTypes);
    window.dispatchEvent(event);
    // need to wait for an animation frame
    expect(ordered).toEqual([]);

    // @ts-expect-error -> flush drag start
    requestAnimationFrame.step();

    expect(ordered).toEqual(['start:external']);
    expect(payloads.length).toBe(1);
    const payload = payloads.at(-1);
    invariant(payload);
    // types are exposed
    expect(sort(payload.types)).toEqual(nativeMediaTypes);
    // items are not exposed
    expect(payload.items.length).toBe(0);
    // `getData` doesn't return values
    for (const key of getKeys(fakeData)) {
      expect(payload.getStringData(key)).toEqual(null);
    }

    ordered.length = 0;
    payloads.length = 0;
  }
  // [] => [A] (entering A)
  {
    const event = new DragEvent('dragenter', {
      cancelable: true,
      bubbles: true,
    });
    addFakeDataToEvent(event);

    // validating setup by ensuring that native event is setup correctly
    expect(sort(event.dataTransfer?.types ?? [])).toEqual(nativeMediaTypes);
    A.dispatchEvent(event);

    expect(ordered).toEqual(['dropTarget:enter', 'change:external']);
    expect(payloads.length).toBe(1);
    const payload = payloads.at(-1);
    invariant(payload);
    // types are exposed
    expect(sort(payload.types)).toEqual(nativeMediaTypes);
    // items are not exposed
    expect(payload.items.length).toBe(0);
    // `getData` doesn't return values
    for (const key of getKeys(fakeData)) {
      expect(payload.getStringData(key)).toEqual(null);
    }

    ordered.length = 0;
    payloads.length = 0;
  }

  // [A] => cancel
  {
    const event = new DragEvent('dragend', {
      cancelable: true,
      bubbles: true,
    });
    addFakeDataToEvent(event);

    // validating setup by ensuring that native event is setup correctly
    expect(sort(event.dataTransfer?.types ?? [])).toEqual(nativeMediaTypes);
    A.dispatchEvent(event);

    expect(ordered).toEqual([
      // leaving the drop target
      'dropTarget:leave',
      'change:external',
      // the drop event
      'drop:external',
    ]);
    expect(payloads.length).toBe(2);
    const payload = payloads.at(-1);
    invariant(payload);
    // types are exposed
    // this also validates that the element adapter type are not exposed
    expect(sort(payload.types)).toEqual(nativeMediaTypes);
    // items are not exposed
    // this also validates that the element adapter item is not exposed
    expect(payload.items.length).toEqual(0);

    // cannot get any string data
    for (const key of getKeys(fakeData)) {
      if (key !== 'Files') {
        expect(payload.getStringData(key)).toEqual(null);
      }
    }
    // all getters will return nothing
    expect(getFiles({ source: payload })).toEqual([]);
    expect(getText({ source: payload })).toEqual(null);
    expect(getURLs({ source: payload })).toEqual([]);
    expect(getHTML({ source: payload })).toEqual(null);

    ordered.length = 0;
    payloads.length = 0;
  }

  cleanup();
});

test('data should not be exposed if a "drop" event occurs due to an unmanaged drop target', () => {
  const [A] = getBubbleOrderedTree();
  const ordered: string[] = [];
  // Using an array rather than `NativePayload | null` as TS was incorrectly narrowing
  // the value to `null` if it is only set inside of the pdnd callbacks
  const payloads: ExternalDragPayload[] = [];

  const cleanup = combine(
    appendToBody(A),
    bindAll(A, [
      {
        type: 'dragover',
        listener: event => {
          event.preventDefault();
        },
      },
      {
        type: 'dragenter',
        listener: event => {
          ordered.push('unmanaged:enter');
          event.preventDefault();
        },
      },
    ]),
    monitorForExternal({
      onDragStart: args => {
        ordered.push(`start:external`);
      },
      onDrop: args => {
        ordered.push(`drop:external`);
        payloads.push(args.source);
      },
    }),
  );

  nativeDrag.startExternal({
    items: [{ type: 'text/plain', data: 'hello' }],
  });

  expect(ordered).toEqual(['start:external']);
  ordered.length = 0;

  fireEvent.dragEnter(A);
  expect(ordered).toEqual(['unmanaged:enter']);

  ordered.length = 0;
  payloads.length = 0;

  const event = nativeDrag.drop({
    items: [{ type: 'text/plain', data: 'hello' }],
    target: A,
  });

  // onDrop will be called
  expect(payloads.length).toBe(1);
  const payload = payloads.at(-1);
  invariant(payload);
  expect(payload.types).toEqual(['text/plain']);

  // no items in the payload as pdnd did not handle the "drop"
  expect(payload.items.length).toBe(0);
  expect(getText({ source: payload })).toEqual(null);

  // data exists on the "drop" event - we are just not exposing it
  expect(event.dataTransfer?.getData('text/plain')).toBe('hello');

  cleanup();
});
