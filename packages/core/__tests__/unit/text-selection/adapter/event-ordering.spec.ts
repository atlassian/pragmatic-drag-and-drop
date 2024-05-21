import { fireEvent } from '@testing-library/dom';

import { combine } from '../../../../src/entry-point/combine';
import {
  dropTargetForTextSelection,
  monitorForTextSelection,
  type TextSelectionDragPayload,
  type TextSelectionEventBasePayload,
} from '../../../../src/entry-point/text-selection/adapter';
import {
  appendToBody,
  getBubbleOrderedTree,
  getTextNode,
  nativeDrag,
  reset,
} from '../../_util';

afterEach(reset);

type Entry = {
  description: string;
  data: TextSelectionDragPayload | null;
  dropTargets: string[];
};

function getDropTargets(
  location: TextSelectionEventBasePayload['location'],
): string[] {
  return location.current.dropTargets.map(dropTarget => dropTarget.element.id);
}

test('scenario: text in drop target', () => {
  const [A] = getBubbleOrderedTree();
  A.textContent = 'Hello world';
  A.id = 'A';
  const ordered: Entry[] = [];

  const cleanup = combine(
    appendToBody(A),
    dropTargetForTextSelection({
      element: A,
      onDragStart: ({ source, location }) => {
        ordered.push({
          description: 'A:start',
          data: source,
          dropTargets: getDropTargets(location),
        });
      },
      onDrag: ({ source, location }) => {
        ordered.push({
          description: 'A:drag',
          data: source,
          dropTargets: getDropTargets(location),
        });
      },
      onDragEnter: ({ source, location }) => {
        ordered.push({
          description: 'A:enter',
          data: source,
          dropTargets: getDropTargets(location),
        });
      },
      onDragLeave: ({ source, location }) => {
        ordered.push({
          description: 'A:leave',
          data: source,
          dropTargets: getDropTargets(location),
        });
      },
      onDropTargetChange: ({ source, location }) => {
        ordered.push({
          description: 'A:change',
          data: source,
          dropTargets: getDropTargets(location),
        });
      },
      onDrop: ({ source, location }) => {
        ordered.push({
          description: 'A:drop',
          data: source,
          dropTargets: getDropTargets(location),
        });
      },
    }),
    monitorForTextSelection({
      onDragStart: ({ source, location }) => {
        ordered.push({
          description: 'monitor:start',
          data: source,
          dropTargets: getDropTargets(location),
        });
      },
      onDrag: ({ source, location }) => {
        ordered.push({
          description: 'monitor:drag',
          data: source,
          dropTargets: getDropTargets(location),
        });
      },
      onDropTargetChange: ({ source, location }) => {
        ordered.push({
          description: 'monitor:change',
          data: source,
          dropTargets: getDropTargets(location),
        });
      },
      onDrop: ({ source, location }) => {
        ordered.push({
          description: 'monitor:drop',
          data: source,
          dropTargets: getDropTargets(location),
        });
      },
    }),
  );

  nativeDrag.startTextSelectionDrag({ element: A });

  const expectedData: TextSelectionDragPayload = {
    target: getTextNode(A),
    plain: 'Hello world',
    HTML: 'Hello world',
  };
  {
    const expected: Entry[] = [
      {
        description: 'A:start',
        data: expectedData,
        dropTargets: ['A'],
      },
      {
        description: 'monitor:start',
        data: expectedData,
        dropTargets: ['A'],
      },
    ];
    expect(ordered).toEqual(expected);
    ordered.length = 0;
  }

  // [A] => [A]
  fireEvent.dragOver(A);
  // drag events are throttled
  // @ts-expect-error
  requestAnimationFrame.step();
  {
    const expected: Entry[] = [
      {
        description: 'A:drag',
        data: expectedData,
        dropTargets: ['A'],
      },
      {
        description: 'monitor:drag',
        data: expectedData,
        dropTargets: ['A'],
      },
    ];
    expect(ordered).toEqual(expected);
    ordered.length = 0;
  }

  // [A] => body
  fireEvent.dragEnter(document.body);
  {
    const expected: Entry[] = [
      {
        description: 'A:change',
        data: expectedData,
        dropTargets: [],
      },
      {
        description: 'A:leave',
        data: expectedData,
        dropTargets: [],
      },
      {
        description: 'monitor:change',
        data: expectedData,
        dropTargets: [],
      },
    ];
    expect(ordered).toEqual(expected);
    ordered.length = 0;
  }

  // body => [A]
  fireEvent.dragEnter(A);
  {
    const expected: Entry[] = [
      {
        description: 'A:change',
        data: expectedData,
        dropTargets: ['A'],
      },
      {
        description: 'A:enter',
        data: expectedData,
        dropTargets: ['A'],
      },
      {
        description: 'monitor:change',
        data: expectedData,
        dropTargets: ['A'],
      },
    ];
    expect(ordered).toEqual(expected);
    ordered.length = 0;
  }

  fireEvent.drop(A);
  {
    const expected: Entry[] = [
      {
        description: 'A:drop',
        data: expectedData,
        dropTargets: ['A'],
      },
      {
        description: 'monitor:drop',
        data: expectedData,
        dropTargets: ['A'],
      },
    ];
    expect(ordered).toEqual(expected);
    ordered.length = 0;
  }

  cleanup();
});

test('scenario: child of drop target', () => {
  const [B, A] = getBubbleOrderedTree();
  A.id = 'A';
  B.textContent = 'Hello world';
  B.id = 'B';
  const ordered: Entry[] = [];

  const cleanup = combine(
    appendToBody(A),
    dropTargetForTextSelection({
      element: A,
      onDragStart: ({ source, location }) => {
        ordered.push({
          description: 'A:start',
          data: source,
          dropTargets: getDropTargets(location),
        });
      },
      onDrag: ({ source, location }) => {
        ordered.push({
          description: 'A:drag',
          data: source,
          dropTargets: getDropTargets(location),
        });
      },
      onDragEnter: ({ source, location }) => {
        ordered.push({
          description: 'A:enter',
          data: source,
          dropTargets: getDropTargets(location),
        });
      },
      onDragLeave: ({ source, location }) => {
        ordered.push({
          description: 'A:leave',
          data: source,
          dropTargets: getDropTargets(location),
        });
      },
      onDropTargetChange: ({ source, location }) => {
        ordered.push({
          description: 'A:change',
          data: source,
          dropTargets: getDropTargets(location),
        });
      },
      onDrop: ({ source, location }) => {
        ordered.push({
          description: 'A:drop',
          data: source,
          dropTargets: getDropTargets(location),
        });
      },
    }),
    monitorForTextSelection({
      onDragStart: ({ source, location }) => {
        ordered.push({
          description: 'monitor:start',
          data: source,
          dropTargets: getDropTargets(location),
        });
      },
      onDrag: ({ source, location }) => {
        ordered.push({
          description: 'monitor:drag',
          data: source,
          dropTargets: getDropTargets(location),
        });
      },
      onDropTargetChange: ({ source, location }) => {
        ordered.push({
          description: 'monitor:change',
          data: source,
          dropTargets: getDropTargets(location),
        });
      },
      onDrop: ({ source, location }) => {
        ordered.push({
          description: 'monitor:drop',
          data: source,
          dropTargets: getDropTargets(location),
        });
      },
    }),
  );

  nativeDrag.startTextSelectionDrag({ element: B });

  const expectedData: TextSelectionDragPayload = {
    target: getTextNode(B),
    plain: 'Hello world',
    HTML: 'Hello world',
  };
  {
    const expected: Entry[] = [
      {
        description: 'A:start',
        data: expectedData,
        dropTargets: ['A'],
      },
      {
        description: 'monitor:start',
        data: expectedData,
        dropTargets: ['A'],
      },
    ];
    expect(ordered).toEqual(expected);
    ordered.length = 0;
  }

  // [A] => [A]
  fireEvent.dragOver(A);
  // drag events are throttled
  // @ts-expect-error
  requestAnimationFrame.step();
  {
    const expected: Entry[] = [
      {
        description: 'A:drag',
        data: expectedData,
        dropTargets: ['A'],
      },
      {
        description: 'monitor:drag',
        data: expectedData,
        dropTargets: ['A'],
      },
    ];
    expect(ordered).toEqual(expected);
    ordered.length = 0;
  }

  // [A] => body
  fireEvent.dragEnter(document.body);
  {
    const expected: Entry[] = [
      {
        description: 'A:change',
        data: expectedData,
        dropTargets: [],
      },
      {
        description: 'A:leave',
        data: expectedData,
        dropTargets: [],
      },
      {
        description: 'monitor:change',
        data: expectedData,
        dropTargets: [],
      },
    ];
    expect(ordered).toEqual(expected);
    ordered.length = 0;
  }

  // body => [A]
  fireEvent.dragEnter(A);
  {
    const expected: Entry[] = [
      {
        description: 'A:change',
        data: expectedData,
        dropTargets: ['A'],
      },
      {
        description: 'A:enter',
        data: expectedData,
        dropTargets: ['A'],
      },
      {
        description: 'monitor:change',
        data: expectedData,
        dropTargets: ['A'],
      },
    ];
    expect(ordered).toEqual(expected);
    ordered.length = 0;
  }

  fireEvent.drop(A);
  {
    const expected: Entry[] = [
      {
        description: 'A:drop',
        data: expectedData,
        dropTargets: ['A'],
      },
      {
        description: 'monitor:drop',
        data: expectedData,
        dropTargets: ['A'],
      },
    ];
    expect(ordered).toEqual(expected);
    ordered.length = 0;
  }

  cleanup();
});
