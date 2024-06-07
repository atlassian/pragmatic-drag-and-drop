import { fireEvent } from '@testing-library/dom';

import { combine } from '../../../../src/entry-point/combine';
import {
	draggable,
	dropTargetForElements,
	monitorForElements,
} from '../../../../src/entry-point/element/adapter';
import { appendToBody, getElements, reset } from '../../_util';

afterEach(reset);

it('should execute callbacks in response to native events', () => {
	const [A] = getElements('div');
	const ordered: string[] = [];

	const cleanup = combine(
		appendToBody(A),
		draggable({
			element: A,
			onGenerateDragPreview: () => ordered.push('draggable:preview'),
			onDragStart: () => ordered.push('draggable:start'),
			onDrag: () => ordered.push('draggable:drag'),
			onDrop: () => ordered.push('draggable:drop'),
			onDropTargetChange: () => ordered.push('draggable:change'),
		}),
		dropTargetForElements({
			element: A,
			onGenerateDragPreview: () => ordered.push('dropTarget:preview'),
			onDragStart: () => ordered.push('dropTarget:start'),
			onDrag: () => ordered.push('dropTarget:drag'),
			onDrop: () => ordered.push('dropTarget:drop'),
			onDropTargetChange: () => ordered.push('dropTarget:change'),
			onDragEnter: () => ordered.push('dropTarget:enter'),
			onDragLeave: () => ordered.push('dropTarget:leave'),
		}),
		monitorForElements({
			onGenerateDragPreview: () => ordered.push('monitor:preview'),
			onDragStart: () => ordered.push('monitor:start'),
			onDrag: () => ordered.push('monitor:drag'),
			onDrop: () => ordered.push('monitor:drop'),
			onDropTargetChange: () => ordered.push('monitor:change'),
		}),
	);

	expect(ordered).toEqual([]);

	// starting a lift, this will trigger the previews to be generated
	fireEvent.dragStart(A);

	expect(ordered).toEqual(['draggable:preview', 'dropTarget:preview', 'monitor:preview']);
	ordered.length = 0;

	// ticking forward an animation frame will complete the lift
	// @ts-expect-error
	requestAnimationFrame.step();
	expect(ordered).toEqual(['draggable:start', 'dropTarget:start', 'monitor:start']);
	ordered.length = 0;

	// [A] -> []
	fireEvent.dragEnter(document.body);
	expect(ordered).toEqual([
		'draggable:change',
		'dropTarget:change',
		'dropTarget:leave',
		'monitor:change',
	]);
	ordered.length = 0;

	// [] -> [A]
	fireEvent.dragEnter(A);
	expect(ordered).toEqual([
		'draggable:change',
		'dropTarget:change',
		'dropTarget:enter',
		'monitor:change',
	]);
	ordered.length = 0;

	// [A] -> [A]
	fireEvent.dragOver(A, { clientX: 10 });
	// no updates yet (need to wait for the next animation frame)
	expect(ordered).toEqual([]);

	// @ts-expect-error
	requestAnimationFrame.step();
	expect(ordered).toEqual(['draggable:drag', 'dropTarget:drag', 'monitor:drag']);
	ordered.length = 0;

	// drop
	fireEvent.drop(A);
	expect(ordered).toEqual(['draggable:drop', 'dropTarget:drop', 'monitor:drop']);

	cleanup();
});
