import { fireEvent } from '@testing-library/dom';

import { combine } from '../../../src/entry-point/combine';
import {
	draggable,
	dropTargetForElements,
	monitorForElements,
} from '../../../src/entry-point/element/adapter';
import { appendToBody, getDefaultInput, getElements, reset } from '../_util';

afterEach(reset);

// 🐛 Bug workaround: intentionally not updating `input` in "dragleave"
// In Chrome, this final "dragleave" has default input values (eg clientX == 0)
// rather than the users current input values
//
// - [Conversation](https://twitter.com/alexandereardon/status/1642697633864241152)
// - [Bug](https://bugs.chromium.org/p/chromium/issues/detail?id=1429937)
it('should not update input published to users based on the "dragleave" event', () => {
	const [A] = getElements('div');
	const ordered: string[] = [];

	function getEntry(label: string, current: { clientX: number; clientY: number }): string {
		return `${label} current:(${current.clientX}, ${current.clientY})`;
	}

	const cleanup = combine(
		appendToBody(A),
		draggable({
			element: A,
			onGenerateDragPreview: ({ location }) =>
				ordered.push(getEntry('draggable:preview', location.current.input)),
			onDragStart: ({ location }) =>
				ordered.push(getEntry('draggable:start', location.current.input)),
			onDrag: ({ location }) => ordered.push(getEntry('draggable:drag', location.current.input)),
			onDrop: ({ location }) => ordered.push(getEntry('draggable:drop', location.current.input)),
			onDropTargetChange: ({ location }) =>
				ordered.push(getEntry('draggable:change', location.current.input)),
		}),
		dropTargetForElements({
			element: A,
			onGenerateDragPreview: ({ location }) =>
				ordered.push(getEntry('dropTarget:preview', location.current.input)),
			onDragStart: ({ location }) =>
				ordered.push(getEntry('dropTarget:start', location.current.input)),
			onDrag: ({ location }) => ordered.push(getEntry('dropTarget:drag', location.current.input)),
			onDrop: ({ location }) => ordered.push(getEntry('dropTarget:drop', location.current.input)),
			onDropTargetChange: ({ location }) =>
				ordered.push(getEntry('dropTarget:change', location.current.input)),
			onDragEnter: ({ location }) =>
				ordered.push(getEntry('dropTarget:enter', location.current.input)),
			onDragLeave: ({ location }) =>
				ordered.push(getEntry('dropTarget:leave', location.current.input)),
		}),
		monitorForElements({
			onGenerateDragPreview: ({ location }) =>
				ordered.push(getEntry('monitor:preview', location.current.input)),
			onDragStart: ({ location }) =>
				ordered.push(getEntry('monitor:start', location.current.input)),
			onDrag: ({ location }) => ordered.push(getEntry('monitor:drag', location.current.input)),
			onDrop: ({ location }) => ordered.push(getEntry('monitor:drop', location.current.input)),
			onDropTargetChange: ({ location }) =>
				ordered.push(getEntry('monitor:change', location.current.input)),
		}),
	);

	expect(ordered).toEqual([]);

	// starting a lift, this will trigger the previews to be generated
	fireEvent.dragStart(A, getDefaultInput({ clientX: 1, clientY: 2 }));

	expect(ordered).toEqual([
		getEntry('draggable:preview', { clientX: 1, clientY: 2 }),
		getEntry('dropTarget:preview', { clientX: 1, clientY: 2 }),
		getEntry('monitor:preview', { clientX: 1, clientY: 2 }),
	]);
	ordered.length = 0;

	// ticking forward an animation frame will complete the lift
	// @ts-expect-error
	requestAnimationFrame.step();
	expect(ordered).toEqual([
		getEntry('draggable:start', { clientX: 1, clientY: 2 }),
		getEntry('dropTarget:start', { clientX: 1, clientY: 2 }),
		getEntry('monitor:start', { clientX: 1, clientY: 2 }),
	]);
	ordered.length = 0;

	// [A] -> []
	fireEvent.dragEnter(document.body, getDefaultInput({ clientX: 3, clientY: 4 }));
	expect(ordered).toEqual([
		getEntry('draggable:change', { clientX: 3, clientY: 4 }),
		getEntry('dropTarget:change', { clientX: 3, clientY: 4 }),
		getEntry('dropTarget:leave', { clientX: 3, clientY: 4 }),
		getEntry('monitor:change', { clientX: 3, clientY: 4 }),
	]);
	ordered.length = 0;

	// [] -> [A]
	fireEvent.dragEnter(A, getDefaultInput({ clientX: 5, clientY: 6 }));
	expect(ordered).toEqual([
		getEntry('draggable:change', { clientX: 5, clientY: 6 }),
		getEntry('dropTarget:change', { clientX: 5, clientY: 6 }),
		getEntry('dropTarget:enter', { clientX: 5, clientY: 6 }),
		getEntry('monitor:change', { clientX: 5, clientY: 6 }),
	]);
	ordered.length = 0;

	// [A] -> [A]
	fireEvent.dragOver(A, getDefaultInput({ clientX: 7, clientY: 8 }));
	// no updates yet (need to wait for the next animation frame)
	expect(ordered).toEqual([]);

	// @ts-expect-error
	requestAnimationFrame.step();
	expect(ordered).toEqual([
		getEntry('draggable:drag', { clientX: 7, clientY: 8 }),
		getEntry('dropTarget:drag', { clientX: 7, clientY: 8 }),
		getEntry('monitor:drag', { clientX: 7, clientY: 8 }),
	]);
	ordered.length = 0;

	// [A] -> cancel. Part 1: dragleave
	fireEvent.dragLeave(A, getDefaultInput({ clientX: 9, clientY: 10 }));

	// using input from last `dragOver`
	expect(ordered).toEqual([
		getEntry('draggable:change', { clientX: 7, clientY: 8 }),
		getEntry('dropTarget:change', { clientX: 7, clientY: 8 }),
		getEntry('dropTarget:leave', { clientX: 7, clientY: 8 }),
		getEntry('monitor:change', { clientX: 7, clientY: 8 }),
	]);
	ordered.length = 0;

	// [A] -> cancel. Part 2: dragend
	fireEvent.dragEnd(A);

	// using input from last `dragOver`
	expect(ordered).toEqual([
		getEntry('draggable:drop', { clientX: 7, clientY: 8 }),
		getEntry('monitor:drop', { clientX: 7, clientY: 8 }),
	]);

	cleanup();
});
