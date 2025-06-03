import { combine } from '../../../src/entry-point/combine';
import { draggable, dropTargetForElements } from '../../../src/entry-point/element/adapter';
import { appendToBody, getElements, reset, userEvent } from '../_util';

afterEach(reset);

test('calling cleanup multiple times for a draggable should not affect other draggables', () => {
	const [A, B] = getElements('div');
	const ordered: string[] = [];

	// The cleanup functions for `appendToBody` are placed in a separate `combine`
	// function, so we can call the cleanup functions for `draggable` multiple times
	const cleanupDocument = combine(appendToBody(A), appendToBody(B));

	const cleanupA = draggable({
		element: A,
		onDragStart: () => ordered.push('a:start'),
	});

	const cleanupB = draggable({
		element: B,
		onDragStart: () => ordered.push('b:start'),
	});

	userEvent.lift(A);
	userEvent.drop(A);

	expect(ordered).toEqual(['a:start']);
	ordered.length = 0;

	cleanupA();

	userEvent.lift(A);
	userEvent.drop(A);

	// No longer listening to drag events for A
	expect(ordered).toEqual([]);

	// Call cleanup function for A again
	cleanupA();

	userEvent.lift(B);
	userEvent.drop(B);

	// Should still be listening to drag events for B
	expect(ordered).toEqual(['b:start']);

	cleanupB();
	cleanupDocument();
});

it('calling cleanup multiple times for a drop target registration should not affect other registrations for that element', () => {
	const [dropTarget] = getElements('div');

	const cleanup1 = dropTargetForElements({
		element: dropTarget,
	});

	expect(dropTarget).toHaveAttribute('data-drop-target-for-element');

	cleanup1();

	expect(dropTarget).not.toHaveAttribute('data-drop-target-for-element');

	// Create a separate drop target registration for the same element
	const cleanup2 = dropTargetForElements({
		element: dropTarget,
	});

	expect(dropTarget).toHaveAttribute('data-drop-target-for-element');

	// Call the cleanup function for the first drop target registration of the element
	cleanup1();

	// The drop target registration should still be active
	expect(dropTarget).toHaveAttribute('data-drop-target-for-element');

	cleanup2();

	expect(dropTarget).not.toHaveAttribute('data-drop-target-for-element');
});
