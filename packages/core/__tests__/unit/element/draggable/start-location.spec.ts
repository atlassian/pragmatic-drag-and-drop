import { draggable, dropTargetForElements } from '../../../../src/adapter/element-adapter';
import { combine } from '../../../../src/public-utils/combine';
import { appendToBody, getBubbleOrderedTree, getElements, reset, userEvent } from '../../_util';

afterEach(reset);

test('scenario: [] (lifting outside a drop target)', () => {
	const [draggableEl] = getElements('div');
	const ordered: string[] = [];

	const cleanup = combine(
		appendToBody(draggableEl),
		draggable({
			element: draggableEl,
			onDragStart: () => ordered.push('draggable:start'),
		}),
	);

	userEvent.lift(draggableEl);

	expect(ordered).toEqual(['draggable:start']);

	cleanup();
});

test('scenario: [B, A] (lifting inside drop targets)', () => {
	const [draggableEl, B, A] = getBubbleOrderedTree();
	const ordered: string[] = [];

	const cleanup = combine(
		appendToBody(A),
		draggable({
			element: draggableEl,
			onDragStart: () => ordered.push('draggable:start'),
		}),
		dropTargetForElements({
			element: A,
			onDragStart: () => ordered.push('a:start'),
		}),
		dropTargetForElements({
			element: B,
			onDragStart: () => ordered.push('b:start'),
		}),
	);

	userEvent.lift(draggableEl);

	expect(ordered).toEqual(['draggable:start', 'b:start', 'a:start']);

	cleanup();
});
