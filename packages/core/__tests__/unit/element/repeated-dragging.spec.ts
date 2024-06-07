import { fireEvent } from '@testing-library/dom';

import { combine } from '../../../src/entry-point/combine';
import { draggable, dropTargetForElements } from '../../../src/entry-point/element/adapter';
import { appendToBody, getElements, reset, userEvent } from '../_util';

afterEach(reset);

it('should allow consecutive drag and drop operations', () => {
	const [target] = getElements('div');
	const ordered: string[] = [];
	const cleanup = combine(
		appendToBody(target),
		draggable({
			element: target,
			onGenerateDragPreview: () => ordered.push('draggable:preview'),
			onDragStart: () => ordered.push('draggable:start'),
			onDrop: () => ordered.push('draggable:drop'),
		}),
		dropTargetForElements({
			element: target,
			onGenerateDragPreview: () => ordered.push('dropTarget:preview'),
			onDragStart: () => ordered.push('dropTarget:start'),
			onDrop: () => ordered.push('dropTarget:drop'),
			onDragEnter: () => ordered.push('dropTarget:enter'),
			onDropTargetChange: () => ordered.push('dropTarget:update'),
			onDragLeave: () => ordered.push('dropTarget:leave'),
		}),
	);

	// [dropTarget] -> drop
	for (let i = 0; i < 10; i++) {
		ordered.push(`attempt ${i}`);
		userEvent.lift(target);
		userEvent.drop(target);
		expect(ordered).toEqual([
			`attempt ${i}`,
			'draggable:preview',
			'dropTarget:preview',
			'draggable:start',
			'dropTarget:start',
			'draggable:drop',
			'dropTarget:drop',
		]);
		ordered.length = 0;
	}

	// [dropTarget] -> cancel
	for (let i = 0; i < 10; i++) {
		ordered.push(`attempt ${i}`);
		userEvent.lift(target);
		userEvent.cancel();
		expect(ordered).toEqual([
			`attempt ${i}`,
			'draggable:preview',
			'dropTarget:preview',
			'draggable:start',
			'dropTarget:start',
			// cancel will trigger us to leave the drop target
			'dropTarget:update',
			'dropTarget:leave',
			'draggable:drop',
		]);
		ordered.length = 0;
	}

	cleanup();
});

it('should allow consecutive drag and drop operations (with lift flushing)', () => {
	const [target] = getElements('div');
	const ordered: string[] = [];
	const cleanup = combine(
		appendToBody(target),
		draggable({
			element: target,
			onGenerateDragPreview: () => ordered.push('draggable:preview'),
			onDragStart: () => ordered.push('draggable:start'),
			onDrop: () => ordered.push('draggable:drop'),
		}),
		dropTargetForElements({
			element: target,
			onGenerateDragPreview: () => ordered.push('dropTarget:preview'),
			onDragStart: () => ordered.push('dropTarget:start'),
			onDrop: () => ordered.push('dropTarget:drop'),
			onDragEnter: () => ordered.push('dropTarget:enter'),
			onDropTargetChange: () => ordered.push('dropTarget:update'),
			onDragLeave: () => ordered.push('dropTarget:leave'),
		}),
	);

	// [dropTarget] -> drop
	for (let i = 0; i < 10; i++) {
		ordered.push(`attempt ${i}`);
		// not waiting for the lift to be completed, it will be flushed
		fireEvent.dragStart(target);
		userEvent.drop(target);
		expect(ordered).toEqual([
			`attempt ${i}`,
			'draggable:preview',
			'dropTarget:preview',
			'draggable:start',
			'dropTarget:start',
			'draggable:drop',
			'dropTarget:drop',
		]);
		ordered.length = 0;
	}

	// [dropTarget] -> cancel
	for (let i = 0; i < 10; i++) {
		ordered.push(`attempt ${i}`);
		// not waiting for the lift to be completed, it will be flushed
		fireEvent.dragStart(target);
		userEvent.cancel();
		expect(ordered).toEqual([
			`attempt ${i}`,
			'draggable:preview',
			'dropTarget:preview',
			'draggable:start',
			'dropTarget:start',
			// cancel will trigger us to leave the drop target
			'dropTarget:update',
			'dropTarget:leave',
			'draggable:drop',
		]);
		ordered.length = 0;
	}

	cleanup();
});
