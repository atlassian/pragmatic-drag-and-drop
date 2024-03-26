import { fireEvent } from '@testing-library/dom';

import { combine } from '../../../../src/entry-point/combine';
import {
  draggable,
  monitorForElements,
} from '../../../../src/entry-point/element/adapter';
import { appendToBody, getElements, reset } from '../../_util';

afterEach(reset);

it('should not treat two monitors as equal that share the same arguments', () => {
  const [A] = getElements('div');
  const ordered: string[] = [];
  const args = {
    onGenerateDragPreview: () => ordered.push('monitor:preview'),
  };
  const cleanup = combine(
    appendToBody(A),
    draggable({
      element: A,
      onGenerateDragPreview: () => ordered.push('draggable:preview'),
    }),
    monitorForElements(args),
    monitorForElements(args),
  );

  fireEvent.dragStart(A);

  expect(ordered).toEqual([
    'draggable:preview',
    'monitor:preview',
    'monitor:preview',
  ]);

  cleanup();
});
