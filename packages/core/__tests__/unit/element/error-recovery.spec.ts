import { fireEvent } from '@testing-library/dom';

import { draggable } from '../../../src/adapter/element-adapter';
import { combine } from '../../../src/public-utils/combine';
import { appendToBody, getElements, reset } from '../_util';

afterEach(reset);

test('an error in "dragstart" will cause a "dragend" which will cancel the drag', () => {
	const [draggableEl] = getElements('div');
	const ordered: string[] = [];
	const cleanup = combine(
		appendToBody(draggableEl),
		draggable({
			element: draggableEl,
			onDragStart: () => ordered.push('start'),
			onDrop: () => ordered.push('drop'),
		}),
	);

	fireEvent.dragStart(draggableEl);

	// simulating an error in "dragstart"
	fireEvent.dragEnd(draggableEl);

	expect(ordered).toEqual(['start', 'drop']);

	cleanup();
});
