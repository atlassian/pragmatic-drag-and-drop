import { combine } from '../../../../src/entry-point/combine';
import {
  dropTargetForExternal,
  monitorForExternal,
} from '../../../../src/entry-point/external/adapter';
import {
  appendToBody,
  assortedNativeMediaTypes,
  getBubbleOrderedTree,
  nativeDrag,
  reset,
} from '../../_util';

afterEach(reset);

test(`scenario: dragging no media`, () => {
  const [A] = getBubbleOrderedTree();
  const ordered: string[] = [];

  const cleanup = combine(
    appendToBody(A),
    dropTargetForExternal({
      element: A,
    }),
    monitorForExternal({
      onDragStart: args => {
        ordered.push(`start:external`);
      },
    }),
  );

  // not dragging anything - no drag started by pdnd
  nativeDrag.startExternal({ items: [] });
  expect(ordered).toEqual([]);

  cleanup();
});

for (const type of assortedNativeMediaTypes) {
  describe(`dragging media type: ${type}`, () => {
    test(`scenario: external => [body]`, () => {
      const [A] = getBubbleOrderedTree();
      const types: string[] = [];
      const ordered: string[] = [];

      const cleanup = combine(
        appendToBody(A),
        dropTargetForExternal({
          element: A,
        }),
        monitorForExternal({
          onDragStart: args => {
            ordered.push(`start:external`);
            types.push(...args.source.types);
          },
        }),
      );

      // Entering the window with files will start a drag
      nativeDrag.startExternal({
        items: [{ data: 'Hello', type: type }],
        target: document.body,
      });

      expect(types).toEqual([type]);
      expect(ordered).toEqual(['start:external']);

      cleanup();
    });

    test(`scenario external => [A]`, () => {
      const [A] = getBubbleOrderedTree();
      const types: string[] = [];
      const ordered: string[] = [];
      const cleanup = combine(
        appendToBody(A),
        dropTargetForExternal({
          element: A,
        }),
        monitorForExternal({
          onDragStart(args) {
            ordered.push(`start:external`);
            types.push(...args.source.types);
          },
        }),
      );

      // First enter event is into A
      nativeDrag.startExternal({
        items: [{ data: 'Hi there', type: type }],
        target: A,
      });

      expect(types).toEqual([type]);
      expect(ordered).toEqual(['start:external']);

      cleanup();
    });
  });
}

test('scenario: multiple media types', () => {
  const [A] = getBubbleOrderedTree();
  const types: string[] = [];
  const ordered: string[] = [];

  const cleanup = combine(
    appendToBody(A),
    dropTargetForExternal({
      element: A,
    }),
    monitorForExternal({
      onDragStart: args => {
        ordered.push(`start:external`);
        types.push(...args.source.types);
      },
    }),
  );

  // Entering the window with files will start a drag
  nativeDrag.startExternal({
    items: assortedNativeMediaTypes.map(type => ({ data: 'hello', type })),
    target: document.body,
  });

  expect(Array.from(types).sort()).toEqual(
    Array.from(assortedNativeMediaTypes).sort(),
  );
  expect(ordered).toEqual(['start:external']);

  cleanup();
});

test('there should be no initial drop targets', () => {
  const ordered: string[] = [];
  const [A] = getBubbleOrderedTree();

  const cleanup = combine(
    appendToBody(A),
    dropTargetForExternal({
      element: A,
      onDragEnter: () => ordered.push('A:enter'),
    }),
    monitorForExternal({
      onDragStart: args => {
        ordered.push(`start:external`);
        ordered.push(`dropTargets:${args.location.current.dropTargets.length}`);
      },
    }),
  );

  nativeDrag.startExternal({
    // first entering into "A", but we will explicitly
    // set the initial drop targets to be `[]`
    target: A,
    items: [{ data: 'Hello', type: 'text/plain' }],
  });
  expect(ordered).toEqual(['start:external', 'dropTargets:0']);

  cleanup();
});
