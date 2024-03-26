import { combine } from '../../../../src/entry-point/combine';
import { draggable } from '../../../../src/entry-point/element/adapter';
import { formatURLsForExternal } from '../../../../src/entry-point/element/format-urls-for-external';
import { appendToBody, getElements, reset } from '../../_util';

afterEach(reset);

it('should allow the ability to add multiple urls to a drag', () => {
  const [A] = getElements('div');
  const ordered: string[] = [];

  const cleanup = combine(
    appendToBody(A),
    draggable({
      element: A,
      onGenerateDragPreview: () => ordered.push('preview'),
      getInitialDataForExternal: () => ({
        'text/uri-list': formatURLsForExternal([
          'https://atlassian.design/',
          'https://domevents.dev/',
        ]),
      }),
    }),
  );

  const event = new DragEvent('dragstart', { bubbles: true });

  A.dispatchEvent(event);

  expect(ordered).toEqual(['preview']);
  expect(event.dataTransfer?.types.includes('text/uri-list')).toBe(true);
  expect(event.dataTransfer?.getData('text/uri-list')).toBe(
    'https://atlassian.design/\r\nhttps://domevents.dev/',
  );

  cleanup();
});
